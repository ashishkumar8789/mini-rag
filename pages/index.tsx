import { useState, useEffect } from 'react';
import Head from 'next/head';

interface Citation {
  index: number;
  content: string;
  source: string;
  title?: string;
  position: number;
  rerankScore: number;
}

interface QueryResponse {
  answer: string;
  citations: Citation[];
  timing: {
    retrievalMs: number;
    rerankMs: number;
    llmMs: number;
    totalMs: number;
  };
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
}

export default function Home() {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);
  const [docCount, setDocCount] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setDocCount(data.count);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadStatus('');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source, title }),
      });

      const data = await res.json();

      if (res.ok) {
        setUploadStatus(
          `✓ Success! Created ${data.stats.chunksCreated} chunks (${data.stats.totalTokens} tokens, ~$${data.stats.estimatedCost.toFixed(6)}, ${data.stats.processingTime}ms)`
        );
        setText('');
        setSource('');
        setTitle('');
        fetchStats();
      } else {
        setUploadStatus(`✗ Error: ${data.error}`);
      }
    } catch (error: any) {
      setUploadStatus(`✗ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQueryResult(null);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (res.ok) {
        setQueryResult(data);
      } else {
        setQueryResult({
          answer: `Error: ${data.error}`,
          citations: [],
          timing: { retrievalMs: 0, rerankMs: 0, llmMs: 0, totalMs: 0 },
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 },
        });
      }
    } catch (error: any) {
      setQueryResult({
        answer: `Error: ${error.message}`,
        citations: [],
        timing: { retrievalMs: 0, rerankMs: 0, llmMs: 0, totalMs: 0 },
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Mini RAG App</title>
        <meta name="description" content="RAG application with retrieval and reranking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen py-8 px-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gradient mb-4">Mini RAG App</h1>
            <p className="text-xl text-white/80 mb-2">Intelligent Document Analysis & Q&A</p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-white/90 font-medium">Documents in database: {docCount}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Upload Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 card-hover border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Upload Document</h2>
              </div>
              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    📝 Document Text *
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-36 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm transition-all duration-200"
                    placeholder="Paste your document text here..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    📄 Source Name *
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm transition-all duration-200"
                    placeholder="e.g., document.txt, article.pdf"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    🏷️ Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm transition-all duration-200"
                    placeholder="Document title"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 btn-glow transform hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload & Process
                    </div>
                  )}
                </button>
              </form>

              {uploadStatus && (
                <div className={`mt-6 p-4 rounded-xl text-sm backdrop-blur-sm border ${
                  uploadStatus.startsWith('✓') 
                    ? 'bg-green-500/20 text-green-100 border-green-400/30' 
                    : 'bg-red-500/20 text-red-100 border-red-400/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {uploadStatus.startsWith('✓') ? (
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {uploadStatus}
                  </div>
                </div>
              )}
            </div>

            {/* Query Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 card-hover border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243 4.242l-2.879 2.879m0-6.414L16 8m-8 8l8-8m0 0v8a4 4 0 01-4 4H8a4 4 0 01-4-4V8a4 4 0 014-4h8" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Ask Question</h2>
              </div>
              <form onSubmit={handleQuery} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    ❓ Your Question
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-36 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm transition-all duration-200"
                    placeholder="Ask a question about your documents..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 btn-glow transform hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Searching...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Get Answer
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Section */}
          {queryResult && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 card-hover border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">AI Answer</h2>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap text-lg">
                  {queryResult.answer}
                </p>
              </div>

              {/* Timing & Cost */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="text-center">
                  <p className="text-xs text-white/60 uppercase tracking-wide">Retrieval</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {queryResult.timing.retrievalMs}ms
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/60 uppercase tracking-wide">Reranking</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {queryResult.timing.rerankMs}ms
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/60 uppercase tracking-wide">LLM</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {queryResult.timing.llmMs}ms
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/60 uppercase tracking-wide">Total</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {queryResult.timing.totalMs}ms
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/60 uppercase tracking-wide">Tokens</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {queryResult.usage.totalTokens}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/60 uppercase tracking-wide">Cost</p>
                  <p className="text-lg font-bold text-green-400 mt-1">
                    ${queryResult.usage.estimatedCost.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Citations */}
              {queryResult.citations.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Source Citations</h3>
                  </div>
                  <div className="space-y-4">
                    {queryResult.citations.map((citation) => (
                      <div
                        key={citation.index}
                        className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200 hover:border-white/20"
                      >
                        <div className="flex items-start gap-4">
                          <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                            {citation.index}
                          </span>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-semibold text-white text-lg">
                                  {citation.title || citation.source}
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                  <p className="text-sm text-white/60">
                                    📄 {citation.source}
                                  </p>
                                  <p className="text-sm text-white/60">
                                    📍 Chunk {citation.position + 1}
                                  </p>
                                  <p className="text-sm text-cyan-400 font-medium">
                                    🎯 Score: {citation.rerankScore.toFixed(3)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <p className="text-white/80 leading-relaxed text-sm bg-white/5 rounded-lg p-4 border-l-4 border-purple-400">
                              {citation.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
