const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static(path.join(__dirname, "client/build")));

// Define the upload route
app.post("/upload", upload.single("file"), async (req, res) => {
	const { file } = req;

	if (!file) {
		return res.status(400).send("No file uploaded.");
	}

	const { path } = file;

	const outputfile =
		file.originalname.substring(0, file.originalname.length - 4) + ".gif";
	console.log("received conversion request for file:" + path);
	// Execute the ffmpeg command to convert the file
	exec(
		`ffmpeg -i ${path} -vf "fps=10,scale=-1:ih:flags=lanczos" ` + outputfile,
		(error) => {
			if (error) {
				console.error("Error converting file:", error);
				return res.status(500).send("Error converting file.");
			}
			console.log("conversion completed :" + path);
			// Return the converted GIF file
			res.download(outputfile, () => {
				// Clean up the uploaded and converted files
				fs.unlink(path, () => {});
				fs.unlink(outputfile, () => {});
			});
		}
	);
});

// Start the server
const port = process.env.port || 8080;
app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
