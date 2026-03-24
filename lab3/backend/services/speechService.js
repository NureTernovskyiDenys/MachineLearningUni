const speech = require('@google-cloud/speech');
const { Storage } = require('@google-cloud/storage');

const speechClient = new speech.SpeechClient();
const storage = new Storage();
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'audio-sentiment-analyzer-bucket-unique'; // Appending -unique just in case

/**
 * Ensures a Google Cloud Storage bucket exists, creates it if not.
 */
const ensureBucket = async () => {
    const bucket = storage.bucket(BUCKET_NAME);
    const [exists] = await bucket.exists();
    if (!exists) {
        await storage.createBucket(BUCKET_NAME, {
            location: 'EU' // Or other appropriate location (e.g., US)
        });
        console.log(`Bucket ${BUCKET_NAME} created.`);
    }
    return bucket;
};

/**
 * Transcribes audio using Google Cloud Speech-to-Text longRunningRecognize
 * @param {string} localFilePath Path to the local audio file to format
 * @param {string} gcsFileName The name the file should have in GCS
 * @param {function} progressCallback Function to report progress/status
 */
const transcribeAudio = async (localFilePath, gcsFileName, progressCallback) => {
    try {
        progressCallback('Завантаження аудіо у Cloud Storage...');
        const bucket = await ensureBucket();
        
        await bucket.upload(localFilePath, {
            destination: gcsFileName
        });

        const gcsUri = `gs://${BUCKET_NAME}/${gcsFileName}`;
        
        progressCallback('Початок розпізнавання мовлення (Speech-to-Text)...');
        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'uk-UA',
            alternativeLanguageCodes: ['en-US'],
            enableAutomaticPunctuation: true
        };

        const audio = {
            uri: gcsUri
        };

        const request = {
            config: config,
            audio: audio,
        };

        const [operation] = await speechClient.longRunningRecognize(request);
        
        progressCallback('Очікування завершення транскрибації...');
        const [response] = await operation.promise();
        
        progressCallback('Обробка результатів...');
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join(' ');

        // Cleanup the file from GCS
        await bucket.file(gcsFileName).delete().catch(e => console.error("Could not delete from GCS:", e));

        return transcription;
    } catch (error) {
        console.error('Error during transcription:', error);
        throw error;
    }
};

module.exports = { transcribeAudio };
