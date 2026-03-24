const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { convertAudio } = require('../services/audioConverter');
const { transcribeAudio } = require('../services/speechService');
const { cleanText, analyzeSentiment } = require('../services/languageService');

// Map to hold statuses of analysis requests
const jobStatuses = new Map();

const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
};

// SSE endpoint to subscribe to job updates
router.get('/status/:jobId', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); 

    const jobId = req.params.jobId;
    
    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const statusObj = jobStatuses.get(jobId);
    if (!statusObj) {
        sendEvent({ status: 'Error', message: 'Job not found' });
        res.end();
        return;
    }

    sendEvent(statusObj);

    const interval = setInterval(() => {
        const currentStatus = jobStatuses.get(jobId);
        sendEvent(currentStatus);
        if (currentStatus.status === 'Completed' || currentStatus.status === 'Error') {
            clearInterval(interval);
            res.end();
            setTimeout(() => { jobStatuses.delete(jobId); }, 60000); 
        }
    }, 2000);

    req.on('close', () => {
        clearInterval(interval);
    });
});

router.post('/analyze', async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const jobId = generateId();
    jobStatuses.set(jobId, { status: 'Processing', message: 'Отримання файлу...', progress: 5 });
    
    res.json({ jobId });

    const updateStatus = (msg, prog, data = null) => {
        const current = jobStatuses.get(jobId) || {};
        jobStatuses.set(jobId, { ...current, status: 'Processing', message: msg, progress: prog, ...data });
    };

    const completeJob = (data) => {
        jobStatuses.set(jobId, { status: 'Completed', message: 'Аналіз завершено', progress: 100, data });
    };

    const failJob = (errorMsg) => {
        jobStatuses.set(jobId, { status: 'Error', message: errorMsg, progress: 0 });
    };

    try {
        const uploadedFilePath = req.file.path;
        const convertedFilePath = path.join('uploads', `${req.file.filename}_mono.wav`);

        updateStatus('Конвертація аудіо (16000 Hz, Mono)...', 10);
        await convertAudio(uploadedFilePath, convertedFilePath);

        updateStatus('Конвертація завершена. Підготовка до транскрибації...', 30);
        
        const gcsFileName = `audio_${jobId}.wav`;
        const transcript = await transcribeAudio(convertedFilePath, gcsFileName, (progressMsg) => {
            updateStatus(progressMsg, 50);
        });

        if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
        if (fs.existsSync(convertedFilePath)) fs.unlinkSync(convertedFilePath);

        updateStatus('Проведення сентимент-аналізу тексту...', 80);
        const cleanedText = cleanText(transcript);
        
        let sentimentResult = { score: 0, magnitude: 0, sentences: [] };
        if (cleanedText.trim().length > 0) {
            sentimentResult = await analyzeSentiment(cleanedText);
        }

        completeJob({
            originalText: transcript,
            cleanedText: cleanedText,
            sentiment: sentimentResult
        });

    } catch (error) {
        console.error('Analysis error:', error);
        failJob(error.message || 'Виникла помилка під час аналізу');
    }
});

module.exports = router;
