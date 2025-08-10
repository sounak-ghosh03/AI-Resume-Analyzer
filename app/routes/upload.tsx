import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";
import { convertPdfToImage } from "~/lib/pdf2image";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants/index";

const upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    };

    const handleAnalyze = async ({
        companyName,
        jobTitle,
        jobDescription,
        file,
    }: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }) => {
        setIsProcessing(true);
        setStatusText("Uploading the file...Processing...");
        const uploadedFile = await fs.upload([file]);
        if (!uploadedFile) {
            alert("Error uploading file");
            setStatusText("Error: Failed to upload file");
            return;
        }
        setStatusText("Converting to image... ");
        const imageFile = await convertPdfToImage(file);
        if (!imageFile) {
            alert("Error converting file to image");
            setStatusText("Error: Failed to convert file to image");
            return;
        }
        setStatusText("Uploading image...");
        const uploadedImage = await fs.upload([imageFile.file ?? new Blob()]);
        if (!uploadedImage) {
            alert("Error uploading image");
            setStatusText("Error: Failed to upload image");
            return;
        }

        setStatusText("Preparing data for processing...");
        const uuid = generateUUID();
        const data = {
            id: uuid,
            companyName,
            jobTitle,
            jobDescription,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            feedback: "",
        };

        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText("Analyzing ...");
        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({
                jobTitle,
                jobDescription,
            })
        );
        if (!feedback) {
            alert("Error analyzing resume");
            setStatusText("Error: Failed to analyze resume");
            return;
        }
        const feedbackText =
            typeof feedback.message.content === "string"
                ? feedback.message.content
                : feedback.message.content[0].text;
        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText("Analysis complete!");
        navigate(`/resume/${uuid}`);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest("form");
        if (!form) {
            return;
        }
        const formData = new FormData(form);

        const companyName = formData.get("company-name") as string;
        const jobTitle = formData.get("job-title") as string;
        const jobDescription = formData.get("job-description") as string;

        if (!file) {
            alert("Please select a file");
            return;
        }
        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };
    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img
                                src="/images/resume-scan.gif"
                                className="w-full"
                            />
                        </>
                    ) : (
                        <h2>
                            Drop your resume for an ATS score and improvement
                            tips
                        </h2>
                    )}
                    {!isProcessing && (
                        <form
                            id="upload-form"
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4 mt-8"
                        >
                            <div className="form-div">
                                <label htmlFor="company-name">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    name="company-name"
                                    placeholder="Company Name"
                                    id="company-name"
                                />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input
                                    type="text"
                                    name="job-title"
                                    placeholder="Job Title"
                                    id="job-title"
                                />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">
                                    Job Description
                                </label>
                                <textarea
                                    rows={5}
                                    name="job-description"
                                    placeholder="Job Description"
                                    id="job-description"
                                />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};
export default upload;
