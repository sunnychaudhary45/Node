const express = require('express');
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require('fs');
const uniqid = require('uniqid');
const environmentsettings = require('../config/environmentsettings');
const settings=environmentsettings.settings();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        // Accept and save file
        cb(null, true)
    }
    else {
        // reject file 
        cb(null, false);
    }
}

const upload = multer({
    storage, limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


router.post('/createDocument', upload.single('file'), async (req, res, next) => {
    try {
        
        fs.exists('documents.json', (exists) => {
            if (exists) {
                fs.readFile('documents.json', 'utf8', (err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        let allRecords = JSON.parse(data);

                        bodyObject(allRecords, req);

                        let allRecordsJson = JSON.stringify(allRecords);
                        WriteFile(allRecordsJson, res);
                    }
                });
            }
            else {
                const newRecord = {
                    list: []
                };

                bodyObject(newRecord, req);
                let newRecordJson = JSON.stringify(newRecord);
                WriteFile(newRecordJson, res);
            }
        });
    }
    catch (ex) {
        next(ex);
    }
});

router.get('/getAllDocuments', async (req, res, next) => {
    try {
        readFile(res);
    }
    catch (ex) {
        next(ex);
    }
});

router.get('/getDocumentById', async (req, res, next) => {
    try {
        const id = req.query.id;

        if (id) {
            fs.exists('documents.json', (exists) => {
                if (exists) {
                    fs.readFile('documents.json', 'utf8', (err, data) => {
                        if (err) {
                            errorFileWritten(res, 'data not found', 400);
                        } else {
                            let allRecords = JSON.parse(data);
                            var result = allRecords.list.filter(x => x.id == id);
                            if (result.length) {
                                res.status(200).send(result[0]);
                            }
                            else {
                                errorFileWritten(res, 'Record not found', 400);
                            }
                        }
                    });
                }
                else {
                    errorFileWritten(res, 'file not found', 400);
                }
            });
        }
        else {
            errorFileWritten(res, 'ID not found', 400);
        }
    }
    catch (ex) {
        next(ex);
    }
});

router.put('/updateDocumentById',upload.single('file'), async (req, res, next) => {
    try {
        const id = req.body.id;
        if (id) {
            fs.exists('documents.json', (exists) => {
                if (exists) {
                    fs.readFile('documents.json', 'utf8', (err, data) => {
                        if (err) {
                            errorFileWritten(res, 'file not found', 400);
                        } else {
                            updateReocrd(data, id, req, res);
                        }
                    });
                }
                else {
                    errorFileWritten(res, 'record not found', 400);
                }
            });
        }
        else {
            res.status(400).send('id not found...');
        }
    }
    catch (ex) {
        next(ex);
    }
});

router.post('/deleteDocumentById', async (req, res, next) => {
    try {
        const id = req.body.id;
        console.log(id);
        if (id) {
            fs.exists('documents.json', (exists) => {
                if (exists) {
                    fs.readFile('documents.json', 'utf8', (err, data) => {
                        if (err) {
                            errorFileWritten(res, 'file not found', 400);
                        } else {
                            deleteDocument(data, id, res);
                        }
                    });
                }
                else {
                    errorFileWritten(res, 'record not found', 400);
                }
            });
        }
        else {
            res.status(400).send('id not found...');
        }
    }
    catch (ex) {
        next(ex);
    }
});

module.exports = router;

function readFile(res) {
    fs.exists('documents.json', (exists) => {
        if (exists) {
            fs.readFile('documents.json', 'utf8', (err, data) => {
                if (err) {
                    errorFileWritten(res, 'data not found', 400);
                }
                else {
                    res.status(200).send(data);
                }
            });
        }
        else {
            errorFileWritten(res, 'file not found', 400);
        }
    });
}

function deleteDocument(data, id, res) {
    let allRecords = JSON.parse(data);
    var result = allRecords.list.filter(x => x.id == id);
    if (result.length) {
        let filteredList = allRecords.list.filter(x => x.id !== id);
        allRecords.list = filteredList;
        const json = JSON.stringify(allRecords);
        fs.writeFile('documents.json', json, 'utf8', (err) => {
            if (err) {
                errorFileWritten(res, 'record not deleted', 400);
            }
            else {
                readFile(res);
            }
        });
    }
    else {
        errorFileWritten(res, 'record not found', 400);
    }
}

function updateReocrd(data, id, req, res) {
    let allRecords = JSON.parse(data);
    var result = allRecords.list.filter(x => x.id == id);
    if (result.length) {
        let filteredList = allRecords.list.filter(x => x.id !== id);
        const file = req.file;
        if(file){
            filteredList.push({
                id: uniqid(),
                subject: req.body.subject,
                editorText: req.body.editorText,
                fileName: file.filename,
                createdDate: new Date()
            });
        }
        else{
            filteredList.push({
                id: uniqid(),
                subject: req.body.subject,
                editorText: req.body.editorText,
                fileName: result[0].fileName,
                createdDate: new Date()
            });
        }
       
        allRecords.list = filteredList;
        const json = JSON.stringify(allRecords);
        fs.writeFile('documents.json', json, 'utf8', (err) => {
            if (err) {
                errorFileWritten(res, 'record not updated', 400);
            }
            else {
                res.status(200).send(data);
            }
        });
    }
    else {
        errorFileWritten(res, 'record not found', 400);
    }
}

function bodyObject(allRecords, req) {
    const file = req.file;
    console.log(file.path);
    if (file) {
        allRecords.list.push({
            id: uniqid(),
            subject: req.body.subject,
            editorText: req.body.editorText,
            fileName: file.filename,
            createdDate: new Date()
        });
    }
    else {
        allRecords.list.push({
            id: uniqid(),
            subject: req.body.subject,
            editorText: req.body.editorText,
            createdDate: new Date()
        });
    }
}

function WriteFile(allRecordsJson, res) {
    fs.writeFile('documents.json', allRecordsJson, 'utf8', (err) => {
        if (err) {
            errorFileWritten(res, 'error file not write', 400);
        }
        else {
            fileWrittenSucess(res, 'written successfully', 200);
        }
    });
}

function fileWrittenSucess(res, errorMessage, errorCode) {
    const error = {
        errorMessage: errorMessage,
        errorCode: errorCode
    };
    res.status(200).send(error);
}

function errorFileWritten(res, errorMessage, errorCode) {
    const error = {
        errorMessage: errorMessage,
        errorCode: errorCode
    };
    res.status(400).send(error);
}
