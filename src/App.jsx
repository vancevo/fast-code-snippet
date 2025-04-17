import React, { useState, useEffect } from 'react';

export default function App() {
    const [entries, setEntries] = useState([]);
    const [language, setLanguage] = useState('');
    const [content, setContent] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [editEntryIndex, setEditEntryIndex] = useState(null);
    const [editBlockIndex, setEditBlockIndex] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('my-snippets');
        if (saved) setEntries(JSON.parse(saved));
    }, []);

    const saveToLocalStorage = (data) => {
        localStorage.setItem('my-snippets', JSON.stringify(data));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let updatedEntries = [...entries];

        // Nếu đang sửa
        if (editEntryIndex !== null && editBlockIndex !== null) {
            updatedEntries[editEntryIndex].contents[editBlockIndex] = content;
            setEditEntryIndex(null);
            setEditBlockIndex(null);
        } else {
            const existingIndex = updatedEntries.findIndex((item) => item.language === language);

            if (existingIndex !== -1) {
                updatedEntries[existingIndex].contents.push(content);
            } else {
                updatedEntries.push({ language, contents: [content] });
            }
        }

        setEntries(updatedEntries);
        saveToLocalStorage(updatedEntries);
        setContent('');
        setLanguage('markdown');
    };

    const handleDelete = (index) => {
        const updated = entries.filter((_, i) => i !== index);
        setEntries(updated);
        saveToLocalStorage(updated);
    };

    const handleEdit = (index) => {
        const entry = entries[index];
        setContent(entry.content);
        setLanguage(entry.language);
        setEditIndex(index);
    };

    const handleEditBlock = (entryIndex, blockIndex) => {
        setContent(entries[entryIndex].contents[blockIndex]);
        setLanguage(entries[entryIndex].language);
        setEditEntryIndex(entryIndex);
        setEditBlockIndex(blockIndex);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    const toggleCollapse = (index) => {
        setExpandedIndex(index === expandedIndex ? null : index);
    };

    const handleDeleteBlock = (entryIndex, blockIndex) => {
        const updated = [...entries];
        updated[entryIndex].contents.splice(blockIndex, 1);

        // Nếu không còn block nào → xoá luôn entry
        if (updated[entryIndex].contents.length === 0) {
            updated.splice(entryIndex, 1);
        }

        setEntries(updated);
        saveToLocalStorage(updated);
    };

    return (
        <div className="mx-auto max-w-3xl p-4">
            <h1 className="text-2xl font-bold mb-4 text-red-500">CODE SNIPPET 🍻</h1>

            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                <input
                    list="language-options"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="Chọn hoặc nhập..."
                    className="border rounded px-3 py-2 w-full"
                    autocomplete="on"
                />

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    placeholder="Nhập nội dung..."
                    className="w-full border rounded px-3 py-2"
                />

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    {editIndex !== null ? 'Cập nhật' : 'Lưu'}
                </button>
            </form>

            <div className="space-y-6">
                {entries.map((entry, index) => (
                    <div key={index} className="border rounded overflow-hidden">
                        <button
                            onClick={() => toggleCollapse(index)}
                            className="w-full flex justify-between items-center bg-gray-100 px-4 py-2 hover:bg-gray-200"
                        >
                            <span className="font-medium">📂 {entry.language}</span>
                            <span>{expandedIndex === index ? '▲' : '▼'}</span>
                        </button>

                        {expandedIndex === index && (
                            <div className="bg-gray-900 text-white p-4 relative">
                                <pre className="overflow-x-auto whitespace-pre-wrap mt-6">
                                    {entry.contents.map((block, blockIndex) => (
                                        <div key={blockIndex} className="relative mb-4 bg-gray-800 rounded">
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <button
                                                    onClick={() => handleEditBlock(index, blockIndex)}
                                                    className="text-sm bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleCopy(block)}
                                                    className="text-sm bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                                                >
                                                    Copy
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBlock(index, blockIndex)}
                                                    className="text-sm bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                            <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-white p-4 pt-8">
                                                <code>{block}</code>
                                            </pre>
                                        </div>
                                    ))}
                                </pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
