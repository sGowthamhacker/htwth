import React, { useState } from 'react';

type Tool = 'base64' | 'url';

const Base64Tool: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    const encode = () => {
        try {
            setOutput(btoa(unescape(encodeURIComponent(input))));
        } catch (e) {
            setOutput('Error: Invalid input for Base64 encoding.');
        }
    };

    const decode = () => {
        try {
            setOutput(decodeURIComponent(escape(atob(input))));
        } catch (e) {
            setOutput('Error: Invalid Base64 string for decoding.');
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="base64-input" className="block text-sm font-medium mb-1">Input</label>
                <textarea
                    id="base64-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={6}
                    className="modern-textarea font-mono"
                    placeholder="Enter text to encode or decode..."
                />
            </div>
            <div className="flex items-center justify-center gap-4">
                <button onClick={encode} className="btn">Encode</button>
                <button onClick={decode} className="btn">Decode</button>
            </div>
            <div>
                <label htmlFor="base64-output" className="block text-sm font-medium mb-1">Output</label>
                <textarea
                    id="base64-output"
                    value={output}
                    readOnly
                    rows={6}
                    className="modern-textarea font-mono bg-slate-100 dark:bg-slate-800"
                    placeholder="Output will appear here..."
                />
            </div>
        </div>
    );
};

const UrlTool: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    const encode = () => {
        setOutput(encodeURIComponent(input));
    };

    const decode = () => {
        try {
            setOutput(decodeURIComponent(input));
        } catch (e) {
            setOutput('Error: Invalid URL encoding for decoding.');
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="url-input" className="block text-sm font-medium mb-1">Input</label>
                <textarea
                    id="url-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={6}
                    className="modern-textarea font-mono"
                    placeholder="Enter string to encode or decode..."
                />
            </div>
            <div className="flex items-center justify-center gap-4">
                <button onClick={encode} className="btn">Encode</button>
                <button onClick={decode} className="btn">Decode</button>
            </div>
            <div>
                <label htmlFor="url-output" className="block text-sm font-medium mb-1">Output</label>
                <textarea
                    id="url-output"
                    value={output}
                    readOnly
                    rows={6}
                    className="modern-textarea font-mono bg-slate-100 dark:bg-slate-800"
                    placeholder="Output will appear here..."
                />
            </div>
        </div>
    );
};

const ToolsPage: React.FC = () => {
    const [activeTool, setActiveTool] = useState<Tool>('base64');

    const tools: { id: Tool; name: string; component: React.ReactElement; }[] = [
        { id: 'base64', name: 'Base64 Encoder/Decoder', component: <Base64Tool /> },
        { id: 'url', name: 'URL Encoder/Decoder', component: <UrlTool /> },
    ];

    return (
        <div className="flex flex-col md:flex-row h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
            <aside className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50">
                <nav className="p-2">
                    <ul className="flex flex-row md:flex-col gap-1 overflow-x-auto hide-scrollbar">
                        {tools.map(tool => (
                            <li key={tool.id} className="flex-shrink-0">
                                <button
                                    onClick={() => setActiveTool(tool.id)}
                                    className={`w-full text-left p-3 text-sm font-medium rounded-md transition-colors ${
                                        activeTool === tool.id
                                            ? 'bg-slate-200 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {tool.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                {tools.find(t => t.id === activeTool)?.component}
            </main>
        </div>
    );
};

export default ToolsPage;