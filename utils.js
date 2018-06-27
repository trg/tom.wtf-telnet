const fs = require('fs');

module.exports = {

    writeFileContents: (socket, relativeFilePath) => {
        return new Promise((resolve, reject) =>  {
            // TODO - security harden
            const filePath = `${__dirname}/files/${relativeFilePath}`;
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    socket.write(data);
                    socket.write('\n'); // always add a new line to end of files
                    resolve();
                }
            });
        });
    },

    cleanInput(data) {
        return data.toString().replace(/(\r\n|\n|\r)/gm,"");
    }
    
}