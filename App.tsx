
import React, { useState, useEffect } from 'react';
import { TestLevel, TestPart, FullTest, UserAnswers } from './types';
import { generateTestContent } from './services/geminiService';
import AudioPlayer from './components/AudioPlayer';

const App: React.FC = () => {
  const [level, setLevel] = useState<TestLevel | null>(null);
  const [test, setTest] = useState<FullTest | null>(null);
  const [activePart, setActivePart] = useState<TestPart>(TestPart.READING);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasKey, setHasKey] = useState<boolean>(true);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({
    reading: {},
    listening: {},
    writing: { 0: "", 1: "" },
    speaking: { 0: null, 1: null }
  });

  const partOrder = [TestPart.READING, TestPart.LISTENING, TestPart.WRITING, TestPart.SPEAKING];

  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      const envKeyValid = typeof process.env.API_KEY === 'string' && 
                          process.env.API_KEY !== 'undefined' && 
                          process.env.API_KEY.length > 10;
      if (aistudio) {
        try {
          const result = await aistudio.hasSelectedApiKey();
          setHasKey(result || envKeyValid);
        } catch (e) {
          setHasKey(envKeyValid);
        }
      } else {
        setHasKey(envKeyValid);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelection = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        setHasKey(true);
      } catch (e) { console.error(e); }
    }
  };

  const startTest = async (selectedLevel: TestLevel) => {
    setLoading(true);
    setLevel(selectedLevel);
    try {
      const generated = await generateTestContent(selectedLevel);
      setTest(generated);
    } catch (err: any) {
      if (err.message?.includes("entity not found") || !hasKey) {
        await handleOpenKeySelection();
      } else {
        alert("Virhe kokeen luomisessa.");
      }
      setLevel(null);
    } finally { setLoading(false); }
  };

  const goToPart = (dir: 'next' | 'prev') => {
    const currentIndex = partOrder.indexOf(activePart);
    if (dir === 'next' && currentIndex < partOrder.length - 1) {
      setActivePart(partOrder[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (dir === 'prev' && currentIndex > 0) {
      setActivePart(partOrder[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPartIcon = (part: TestPart) => {
    switch (part) {
      case TestPart.READING: return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
      case TestPart.LISTENING: return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
      case TestPart.WRITING: return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
      case TestPart.SPEAKING: return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
    }
  };

  if (!level) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <header className="text-center mb-16 animate-in fade-in zoom-in duration-700">
          <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl transform hover:rotate-6 transition-transform">
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="text-5xl font-extrabold text-purple-900 mb-3 tracking-tight">SuomiPolku</h1>
          <p className="text-lg text-slate-500 font-medium max-w-sm mx-auto">Valloita YKI-testi älykkäällä harjoittelulla.</p>
          
          {!hasKey && (
            <button onClick={handleOpenKeySelection} className="mt-8 px-6 py-2.5 bg-white text-purple-700 font-bold rounded-full border border-purple-200 shadow hover:shadow-md hover:bg-purple-50 transition-all text-sm">
              Määritä API-yhteys
            </button>
          )}
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
          {[TestLevel.PERUSTASO, TestLevel.KESKITASO].map(lvl => (
            <button 
              key={lvl}
              onClick={() => startTest(lvl)}
              disabled={loading}
              className="group relative bg-white p-8 rounded-3xl shadow-md border border-slate-100 hover:border-purple-300 hover:shadow-xl transition-all text-left active:scale-[0.98]"
            >
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold mb-4 uppercase tracking-wider ${lvl === TestLevel.PERUSTASO ? 'bg-purple-50 text-purple-600' : 'bg-violet-50 text-violet-600'}`}>{lvl}</span>
              <h2 className="text-3xl font-bold mb-3 text-slate-800 tracking-tight">{lvl === TestLevel.PERUSTASO ? 'Perustaso (A1-A2)' : 'Keskitaso (B1-B2)'}</h2>
              <p className="text-slate-500 font-normal text-sm leading-relaxed">
                {lvl === TestLevel.PERUSTASO ? 'Arkielämän kielenkäyttöä ja peruskielitaitoa.' : 'Työelämässä ja kansalaisuuden hakuun tarvittava taso.'}
              </p>
              {loading && level === lvl && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 rounded-3xl z-10">
                  <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading || !test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-center">
        <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-8"></div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Rakennetaan koetta...</h2>
        <div className="mt-6 space-y-2">
          <p className="text-slate-500">Luodaan uusia {level}-tason tehtäviä.</p>
          <p className="text-purple-600/60 text-sm font-medium animate-pulse">Tämä voi kestää noin minuutin. Ole hyvä ja odota.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      <nav className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-slate-100 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <button onClick={() => setLevel(null)} className="text-purple-700 font-extrabold text-2xl tracking-tight hover:opacity-80 transition-opacity">SuomiPolku</button>
          
          <div className="flex gap-1 bg-slate-50 p-1 rounded-xl overflow-x-auto w-full md:w-auto">
            {partOrder.map(part => (
              <button
                key={part}
                onClick={() => setActivePart(part)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activePart === part ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-purple-700'
                }`}
              >
                {renderPartIcon(part)}
                <span className="hidden sm:inline">{part}</span>
              </button>
            ))}
          </div>

          <button onClick={() => { setIsSubmitted(true); window.scrollTo({top:0, behavior:'smooth'}); }} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-full hover:bg-black transition-all text-xs">
            {isSubmitted ? 'UUSI KOE' : 'PALAUTA'}
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 md:p-8 mt-8">
        {activePart === TestPart.READING && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {test.reading.map((task, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-purple-50/50 p-8 border-b border-purple-50">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">{task.title}</h3>
                </div>
                <div className="p-8 md:p-12 space-y-10">
                  <p className="text-slate-700 leading-relaxed text-lg font-normal whitespace-pre-wrap">{task.text}</p>
                  <div className="space-y-8 pt-8 border-t border-slate-50">
                    {task.questions.map(q => (
                      <div key={q.id} className="space-y-5">
                        <p className="font-bold text-slate-900 text-lg">{q.text}</p>
                        <div className="grid gap-3">
                          {q.options?.map(opt => (
                            <label key={opt} className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer text-sm ${
                              isSubmitted && opt === q.correctAnswer ? 'bg-purple-50 border-purple-400 font-bold' :
                              isSubmitted && userAnswers.reading[q.id] === opt ? 'bg-red-50 border-red-200' :
                              userAnswers.reading[q.id] === opt ? 'bg-purple-50 border-purple-300' : 'hover:bg-slate-50 border-slate-200'
                            }`}>
                              <input type="radio" name={q.id} checked={userAnswers.reading[q.id] === opt} onChange={() => setUserAnswers(p => ({...p, reading: {...p.reading, [q.id]: opt}}))} disabled={isSubmitted} className="w-4 h-4 text-purple-600" />
                              <span className="ml-3">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activePart === TestPart.LISTENING && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {test.listening.map((task, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
                <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Kuuntelutehtävä {idx + 1}</h3>
                <AudioPlayer text={task.audioPrompt} variant="bar" />
                <div className="space-y-10 mt-10">
                  {task.questions.map(q => (
                    <div key={q.id} className="space-y-5">
                      <p className="font-bold text-slate-900 text-lg">{q.text}</p>
                      <div className="grid gap-3">
                        {q.options?.map(opt => (
                          <label key={opt} className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer text-sm ${
                            isSubmitted && opt === q.correctAnswer ? 'bg-purple-50 border-purple-400 font-bold' :
                            userAnswers.listening[q.id] === opt ? 'bg-purple-50 border-purple-300' : 'hover:bg-slate-50 border-slate-200'
                          }`}>
                            <input type="radio" checked={userAnswers.listening[q.id] === opt} onChange={() => setUserAnswers(p => ({...p, listening: {...p.listening, [q.id]: opt}}))} disabled={isSubmitted} className="w-4 h-4 text-purple-600" />
                            <span className="ml-3">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {isSubmitted && <div className="mt-8 p-6 bg-slate-50 rounded-xl text-slate-600 text-sm italic">{task.transcript}</div>}
              </div>
            ))}
          </div>
        )}

        {activePart === TestPart.WRITING && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {test.writing.map((task, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 space-y-8">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{task.prompt}</h3>
                  <p className="text-slate-500 text-sm">{task.context}</p>
                </div>
                <div className="relative">
                  <textarea
                    rows={8}
                    className="w-full p-6 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all text-base font-normal outline-none bg-white"
                    placeholder="Kirjoita tähän..."
                    value={userAnswers.writing[idx] || ""}
                    onChange={e => setUserAnswers(p => ({...p, writing: {...p.writing, [idx]: e.target.value}}))}
                    disabled={isSubmitted}
                  />
                  <div className="absolute bottom-4 right-6 text-slate-300 font-bold text-[10px] uppercase tracking-wider">
                    {(userAnswers.writing[idx] || "").length} merkkiä
                  </div>
                </div>
                {isSubmitted && (
                  <div className="p-6 bg-purple-50/30 border border-purple-100 rounded-xl">
                    <p className="font-bold mb-3 text-xs uppercase tracking-widest text-purple-700">Mallivastaus:</p>
                    <p className="text-base text-slate-700 leading-relaxed">{task.sampleModelAnswer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activePart === TestPart.SPEAKING && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {test.speaking.map((task, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 text-center space-y-8">
                <h3 className="text-xl font-bold text-slate-900">Puhetehtävä {idx + 1}</h3>
                <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200">
                  <p className="text-2xl font-bold text-slate-800 mb-4">{task.prompt}</p>
                  <p className="text-base text-slate-500">{task.context}</p>
                </div>
                <div className="flex flex-col items-center gap-4 pt-4">
                   <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center border border-purple-100">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                   </div>
                   <p className="text-slate-400 text-xs font-medium italic">Harjoittele puhumista ääneen. Koe on simulaatio – ääntä ei tallenneta.</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 flex justify-between items-center px-4">
           <button 
             onClick={() => goToPart('prev')} 
             disabled={partOrder.indexOf(activePart) === 0}
             className="flex items-center gap-2 font-bold text-slate-400 disabled:opacity-0 hover:text-purple-700 transition-all text-sm group"
           >
             <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
             EDELLINEN
           </button>
           
           <button 
             onClick={() => goToPart('next')} 
             disabled={partOrder.indexOf(activePart) === partOrder.length - 1}
             className="flex items-center gap-2 font-bold text-slate-400 disabled:opacity-0 hover:text-purple-700 transition-all text-sm group"
           >
             SEURAAVA
             <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
           </button>
        </div>
      </main>
    </div>
  );
};

export default App;
