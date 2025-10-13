const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// Ensure the 'cookbook-images' directory exists
const uploadDir = 'cookbook-images';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // The filename is sent from the client
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(express.json());

app.post('/save-recipe', (req, res) => {
    let { filename, htmlContent } = req.body;

    if (!filename || !htmlContent) {
        return res.status(400).send('Filename and HTML content are required.');
    }

    if (!filename.endsWith('.html')) {
        filename += '.html';
    }

    fs.writeFile(filename, htmlContent, (err) => {
        if (err) {
            console.error('Error saving recipe:', err);
            return res.status(500).send('Error saving recipe.');
        }
        res.send('Recipe saved successfully!');
    });
});

app.post('/update-menu', (req, res) => {
    const { menuItemHtml } = req.body;

    if (!menuItemHtml) {
        return res.status(400).send('Menu item HTML is required.');
    }

    const menuFilePath = path.join(__dirname, 'cookbookMenu.html');

    fs.readFile(menuFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading menu file:', err);
            return res.status(500).send('Error reading menu file.');
        }

        const scriptTagIndex = data.indexOf('<script');
        if (scriptTagIndex === -1) {
            return res.status(500).send('Could not find script tag in menu file.');
        }

        const updatedData = data.slice(0, scriptTagIndex) + menuItemHtml + data.slice(scriptTagIndex);

        fs.writeFile(menuFilePath, updatedData, (err) => {
            if (err) {
                console.error('Error writing to menu file:', err);
                return res.status(500).send('Error writing to menu file.');
            }
            res.send('Menu updated successfully!');
        });
    });
});

app.post('/upload', upload.array('images'), (req, res) => {
    res.send('Images uploaded successfully!');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
