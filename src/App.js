import React, { useState, useCallback, useMemo } from 'react';

// --- Helper Functions & Constants ---

const API_CALL_DELAY = 1000; // ms

// --- Icon Components (using inline SVG for simplicity) ---

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const ClipboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
);

const WandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6.343 6.343l-2.828 2.828M17.657 17.657l2.828 2.828m-2.828-2.828l-2.828 2.828M12 21v-4M21 12h-4M12 3v4M3 12h4m-2.828-2.828l2.828 2.828m11.314 0l2.828-2.828M12 12l2.828 2.828" />
    </svg>
);

const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);


// --- Main App Component ---

function App() {
    const [cvText, setCvText] = useState('');
    const [jobDesc, setJobDesc] = useState('');
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const handleCvUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                setCvText("This is simulated text from your CV. Replace with actual extraction logic. \n\nJohn Doe\nSoftware Engineer\nSkills: React, Node.js, Python");
            };
            reader.onerror = () => {
                 setError("Error reading file. Please try again.");
            }
            reader.readAsText(file);
        }
    };

    const handleTailorCv = useCallback(async () => {
        if (!cvText || !jobDesc) {
            setError("Please upload your CV and paste the job description.");
            return;
        }
        setIsLoading(true);
        setError('');
        setResults(null);

        // --- Gemini API Call ---
        const prompt = `
            You are an expert career coach. Analyze the provided CV and Job Description.
            Return a JSON object: { "tailoredCv": "...", "coverLetter": "...", "atsScore": "...", "suggestions": ["...", "..."] }
            - tailoredCv: Rewrite the CV to match the job description's keywords and skills. Use action verbs and quantify achievements.
            - coverLetter: A 3-paragraph cover letter, personalized to the role and company.
            - atsScore: A number (0-100) for the CV-job match.
            - suggestions: 3-5 actionable tips to improve the CV further.
        `;
        
        const chatHistory = [{ role: "user", parts: [{ text: `CV:\n${cvText}\n\nJOB:\n${jobDesc}\n\nTASK:\n${prompt}` }] }];
        const payload = { 
            contents: chatHistory,
            generationConfig: {
                responseMimeType: "application/json",
            }
        };
        
        const apiKey = process.env.REACT_APP_JobReadyAI_APP;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        try {
            await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY));
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]) {
                const text = result.candidates[0].content.parts[0].text;
                const parsedJson = JSON.parse(text);
                setResults(parsedJson);
            } else {
                throw new Error("Unexpected API response structure.");
            }
        } catch (err) {
            console.error("API Error:", err);
            setError("Failed to tailor your CV. The AI may be busy. Please try again in a moment.");
        } finally {
            setIsLoading(false);
        }
    }, [cvText, jobDesc]);
    
    const canTailor = useMemo(() => cvText && jobDesc && !isLoading, [cvText, jobDesc, isLoading]);

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
            <div className="container mx-auto p-4 md:p-8">
                
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-black-600">JobReady AI</h1>
                    <p className="text-slate-500 mt-2 text-lg">Get your CV and cover letter optimized for any job in seconds.</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-8">
                        <CVUploader onCvUpload={handleCvUpload} fileName={fileName} />
                        <JobDescriptionInput onJobDescChange={(e) => setJobDesc(e.target.value)} value={jobDesc} />
                        <BulletPointEnhancer />
                    </div>

                    {/* Action & Results Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col">
                        <div className="flex-grow">
                             <div className="text-center mb-6">
                                <button
                                    onClick={handleTailorCv}
                                    disabled={!canTailor}
                                    className={`w-full flex items-center justify-center text-lg font-semibold py-4 px-6 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 ${
                                        canTailor 
                                        ? 'bg-[#3e4444] text-white shadow-md hover:bg-[#3e4444]' 
                                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    }`}
                                >
                                    <WandIcon />
                                    {isLoading ? 'Tailoring Your Future...' : '✨ Tailor My CV & Cover Letter'}
                                </button>
                                {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
                            </div>
                            {isLoading && <LoadingSpinner />}
                            {results && <ResultsDisplay results={results} cvText={cvText} jobDesc={jobDesc} />}
                            {!isLoading && !results && <Placeholder />}
                        </div>
                    </div>
                </main>
                
                <footer className="text-center mt-12 text-slate-400 text-sm">
    <p>
        Made with <span className="text-red-500">&#9829;</span> by <a className='text-blue-600' href='https:github.com/thejatinbaghel'>Jatin Baghel</a>
    </p>
</footer>
            </div>
        </div>
    );
}


// --- Child Components ---

const CVUploader = ({ onCvUpload, fileName }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold mb-4 flex items-center"><UploadIcon /> 1. Upload Your CV</h2>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
            <input type="file" id="cv-upload" className="hidden" accept=".pdf,.docx,.txt" onChange={onCvUpload} />
            <label htmlFor="cv-upload" className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg inline-block transition-colors">
                Choose File
            </label>
            {fileName && <p className="mt-4 text-sm text-slate-600">Selected: <span className="font-medium">{fileName}</span></p>}
        </div>
    </div>
);

const JobDescriptionInput = ({ onJobDescChange, value }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold mb-4 flex items-center"><ClipboardIcon /> 2. Paste Job Description</h2>
        <textarea
            value={value}
            onChange={onJobDescChange}
            placeholder="e.g., 'We are looking for a proactive Software Engineer...'"
            className="w-full h-48 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
    </div>
);

const BulletPointEnhancer = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [error, setError] = useState('');

    const handleEnhance = useCallback(async () => {
        if (!inputText) return;
        setIsEnhancing(true);
        setError('');
        setOutputText('');

        const prompt = `You are an expert resume writer. Rewrite the following text into 2-3 impactful, achievement-based bullet points using the STAR method. Return a single string with each bullet point starting with '• ' and separated by a newline. USER TEXT: "${inputText}"`;

        const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = process.env.REACT_APP_JobReadyAI_APP; // Canvas will provide the key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`API request failed`);
            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                setOutputText(result.candidates[0].content.parts[0].text);
            } else {
                throw new Error("Unexpected API response structure.");
            }
        } catch (err) {
            setError("Failed to enhance text. Please try again.");
        } finally {
            setIsEnhancing(false);
        }
    }, [inputText]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold mb-4 flex items-center"><SparklesIcon /> Bullet Point Enhancer</h2>
            <p className="text-slate-500 mb-4 text-sm">Turn a simple task into an achievement. Enter a sentence below.</p>
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g., 'I was in charge of the company newsletter.'"
                className="w-full h-24 p-3 border border-slate-300 rounded-lg"
            />
            <button
                onClick={handleEnhance}
                disabled={isEnhancing || !inputText}
                className={`w-full mt-4 flex items-center justify-center font-semibold py-2 px-4 rounded-lg transition-all ${
                    isEnhancing || !inputText ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
            >
                ✨ {isEnhancing ? 'Enhancing...' : 'Enhance Text'}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {outputText && (
                <div className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200">
                    <h4 className="font-semibold mb-2">Suggested Bullet Points:</h4>
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">{outputText}</pre>
                </div>
            )}
        </div>
    );
};


const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center text-center h-full p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-slate-600 font-semibold">Analyzing documents and crafting your application...</p>
    </div>
);

const Placeholder = () => (
    <div className="flex flex-col items-center justify-center text-center h-full p-8 bg-slate-50 rounded-lg">
        <WandIcon />
        <h3 className="text-xl font-bold text-slate-700 mt-4">Your tailored results will appear here.</h3>
        <p className="text-slate-500 mt-2">Upload your CV, paste a job description, and click the blue button above to start.</p>
    </div>
);

const ResultsDisplay = ({ results, cvText, jobDesc }) => {
    const { tailoredCv, coverLetter, atsScore, suggestions } = results;

    const downloadTxtFile = () => {
        const content = `--- TAILORED CV ---\n\n${tailoredCv}\n\n\n--- COVER LETTER ---\n\n${coverLetter}`;
        const element = document.createElement("a");
        const file = new Blob([content], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "AI_Tailored_Application.txt";
        document.body.appendChild(element);
        element.click();
        element.remove();
    }

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h3 className="text-xl font-bold mb-3">ATS Optimization Score</h3>
                <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full" viewBox="0 0 36 36"><path className="text-slate-200" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /><path className="text-blue-600" strokeWidth="3" strokeDasharray={`${atsScore}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /></svg>
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center"><span className="text-2xl font-bold text-[#3e4444]">{atsScore}%</span></div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-slate-700">Improvement Suggestions</h4>
                        <ul className="mt-2 space-y-1 list-inside">
                           {suggestions.map((suggestion, index) => (<li key={index} className="flex items-start text-sm text-slate-600"><CheckCircleIcon /><span>{suggestion}</span></li>))}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="text-center">
                <button onClick={downloadTxtFile} className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"><DownloadIcon />Download as .TXT</button>
            </div>

            <Tabs tailoredCv={tailoredCv} coverLetter={coverLetter} />

            <InterviewQuestionPredictor cvText={cvText} jobDesc={jobDesc} />
        </div>
    );
};

const Tabs = ({ tailoredCv, coverLetter }) => {
    const [activeTab, setActiveTab] = useState('cv');
    return (
        <div>
            <div className="border-b border-slate-200 mb-4">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('cv')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'cv' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Tailored CV</button>
                    <button onClick={() => setActiveTab('letter')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'letter' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Cover Letter</button>
                </nav>
            </div>
            <div>
                {activeTab === 'cv' && <ContentBox content={tailoredCv} />}
                {activeTab === 'letter' && <ContentBox content={coverLetter} />}
            </div>
        </div>
    );
};

const ContentBox = ({ content }) => (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">{content}</pre>
    </div>
);

const InterviewQuestionPredictor = ({ cvText, jobDesc }) => {
    const [questions, setQuestions] = useState(null);
    const [isPredicting, setIsPredicting] = useState(false);
    const [error, setError] = useState('');

    const handlePredict = useCallback(async () => {
        setIsPredicting(true);
        setError('');
        setQuestions(null);

        const prompt = `
            As a senior hiring manager, analyze the provided TAILORED CV and JOB DESCRIPTION.
            Generate a list of likely interview questions.
            Return a JSON object with this structure: { "behavioral": ["...", "..."], "technical": ["...", "..."], "situational": ["...", "..."] }
        `;

        const chatHistory = [{ role: "user", parts: [{ text: `CV:\n${cvText}\n\nJOB:\n${jobDesc}\n\nTASK:\n${prompt}` }] }];
        const payload = { 
            contents: chatHistory,
            generationConfig: { responseMimeType: "application/json" }
        };
        const apiKey =  process.env.REACT_APP_JobReadyAI_APP;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('API request failed');
            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                const parsed = JSON.parse(result.candidates[0].content.parts[0].text);
                setQuestions(parsed);
            } else {
                throw new Error("Unexpected API response for questions.");
            }
        } catch (err) {
            setError("Couldn't predict questions. The AI might be busy.");
        } finally {
            setIsPredicting(false);
        }
    }, [cvText, jobDesc]);

    return (
        <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-2xl font-bold mb-4 flex items-center"><LightbulbIcon /> Interview Question Predictor</h3>
            <p className="text-slate-500 mb-4 text-sm">Get ready for your interview. Click the button to generate questions based on your tailored CV and the job description.</p>
            <button
                onClick={handlePredict}
                disabled={isPredicting}
                className={`w-full flex items-center justify-center font-semibold py-3 px-4 rounded-lg transition-all ${
                    isPredicting ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#034f84] text-white hover:bg-[#034f84]'
                }`}
            >
                ✨ {isPredicting ? 'Predicting Questions...' : 'Predict My Interview Questions'}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {questions && (
                <div className="mt-6 space-y-4">
                    {Object.entries(questions).map(([category, qList]) => (
                        qList.length > 0 && (
                            <div key={category}>
                                <h4 className="font-bold text-lg capitalize text-slate-800 mb-2">{category} Questions</h4>
                                <ul className="space-y-2 list-disc list-inside pl-2">
                                    {qList.map((q, i) => <li key={i} className="text-slate-600">{q}</li>)}
                                </ul>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

export default App;