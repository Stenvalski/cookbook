document.addEventListener('DOMContentLoaded', () => {
    const generateHtmlBtn = document.getElementById('generateHtml');
    const copyHtmlBtn = document.getElementById('copyHtml');
    const saveRecipeBtn = document.getElementById('saveRecipe');
    const generatedHtmlPre = document.getElementById('generatedHtml');
    const generatedMenuItemPre = document.getElementById('generatedMenuItem');
    const copyMenuItemBtn = document.getElementById('copyMenuItem');
    const imageUpload = document.getElementById('imageUpload');
    let uploadedFiles = [];

    imageUpload.addEventListener('change', (event) => {
        uploadedFiles = Array.from(event.target.files);
    });

    generateHtmlBtn.addEventListener('click', () => {
        const title = document.getElementById('recipeTitle').value;
        let filename = document.getElementById('recipeFilename').value;
        if (filename && !filename.endsWith('.html')) {
            filename += '.html';
            document.getElementById('recipeFilename').value = filename;
        }
        const ingredients = document.getElementById('ingredients').value.split('\n').filter(line => line.trim() !== '');
        const instructions = document.getElementById('instructions').value.split('\n').filter(line => line.trim() !== '');

        if (!title || !filename || uploadedFiles.length === 0 || ingredients.length === 0 || instructions.length === 0) {
            alert('Please fill in all fields and upload at least one image.');
            return;
        }

        const filenameWithoutExt = filename.replace(/\.[^/.]+$/, "");

        const imageUrls = uploadedFiles.map((file, index) => {
            const extension = file.name.split('.').pop();
            return `cookbook-images/${filenameWithoutExt}-${index + 1}.${extension}`;
        });

        const ingredientsHtml = ingredients.map(item => `                <li>${item}</li>`).join('\n');
        const instructionsHtml = instructions.map(item => `            <li>${item}</li>`).join('\n');

        let imageHtml = '';
        if (imageUrls.length === 1) {
            imageHtml = `
        <div class="item pic">
            <img src="${imageUrls[0]}" alt="${title}">
            <p class="caption">${title}</p>
        </div>`;
        } else if (imageUrls.length > 1) {
            imageHtml = `
        <div class="container">
            <div class="item pic">
                <img src="${imageUrls[0]}" alt="${title}">
                <p class="caption">${title}</p>
            </div>
        </div>
        <div class="container">
            ${imageUrls.slice(1).map(url => `
            <div class="item pic">
                <img src="${url}" alt="${title}">
            </div>`).join('')}
        </div>`;
        }

        const generatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="cookbook_style.css">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap" rel="stylesheet">
    <style>

        .menu{
            display: flex;
            justify-content: space-evenly;
            width: 4rem;
            height: 4rem;
            flex-wrap: wrap;
            position: absolute;
            z-index: 2;
            left: 10px;
            top: 10px;
        }

        .menu > *{
            --side: .9rem;
            width: var(--side);
            height: var(--side);
            margin: 3px;
            background-color: rgb(255, 255, 255);
        }

        .menu:hover >*  {
            margin: 1px;
        }
    </style>
</head>
<body>

    <a href="CookbookMenu.html">
        <div class="menu">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </a>

    ${imageHtml}

    <div class="item ingredients">
        <h2>Ingredients</h2>
            <ul>
${ingredientsHtml}
            </ul>
    </div>

    <div class="item instructions">
        <h2>Instructions</h2>
        <ol>
${instructionsHtml}
        </ol>
    <div class="space">
        
    </div>
</div>

</body>
</html>`;

        generatedHtmlPre.textContent = generatedHtml;
    });

    copyHtmlBtn.addEventListener('click', () => {
        const textToCopy = generatedHtmlPre.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('HTML copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy HTML. Please copy manually.');
        });
    });

    saveRecipeBtn.addEventListener('click', () => {
        const title = document.getElementById('recipeTitle').value;
        let filename = document.getElementById('recipeFilename').value;
        if (filename && !filename.endsWith('.html')) {
            filename += '.html';
            document.getElementById('recipeFilename').value = filename;
        }

        if (!title || !filename || uploadedFiles.length === 0) {
            alert('Please fill in the title, filename, and upload at least one image.');
            return;
        }

        const filenameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        const firstImageExtension = uploadedFiles[0].name.split('.').pop();
        const imageUrl = `cookbook-images/${filenameWithoutExt}-1.${firstImageExtension}`;

        const menuItemHtml = `
    <div class="card">
        <a href = "${filename}" target = "_self"><img src="${imageUrl}" ></a>
        <div class="text">
            <p>${title}</p>
        </div>
    </div>
    \n`
    ;

        generatedMenuItemPre.textContent = menuItemHtml;

        const formData = new FormData();
        uploadedFiles.forEach((file, index) => {
            const extension = file.name.split('.').pop();
            const newFilename = `${filenameWithoutExt}-${index + 1}.${extension}`;
            formData.append('images', file, newFilename);
        });

        fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            const generatedHtml = generatedHtmlPre.textContent;
            fetch('http://localhost:3000/save-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ filename, htmlContent: generatedHtml })
            })
            .then(response => response.text())
            .then(data => {
                console.log(data);
                const menuItemHtml = generatedMenuItemPre.textContent;
                fetch('http://localhost:3000/update-menu', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ menuItemHtml })
                })
                .then(response => response.text())
                .then(data => {
                    console.log(data);
                    alert('Recipe created, images uploaded, and menu updated successfully!');
                })
                .catch(error => {
                    console.error('Error updating menu:', error);
                    alert('Error updating menu. See the console for details.');
                });
            })
            .catch(error => {
                console.error('Error saving recipe:', error);
                alert('Error saving recipe. See the console for details.');
            });
        })
        .catch(error => {
            console.error('Error uploading images:', error);
            alert('Error uploading images. See the console for details.');
        });
    });

    copyMenuItemBtn.addEventListener('click', () => {
        const textToCopy = generatedMenuItemPre.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Menu item HTML copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy menu item HTML. Please copy manually.');
        });
    });
});