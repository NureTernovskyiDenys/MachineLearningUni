const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Converts audio file to mono channel 16000Hz WAV
 * @param {string} inputPath Path to original audio file
 * @param {string} outputPath Path to save converted audio file
 * @returns {Promise<string>} Output path
 */
const convertAudio = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat('wav')
            .audioChannels(1)
            .audioFrequency(16000)
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
};

module.exports = { convertAudio };
