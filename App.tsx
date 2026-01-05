
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
        <header className="text-center mb-12">
          <div className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transform rotate-3">
             <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="text-7xl font-black text-emerald-900 mb-2 tracking-tighter">SuomiPolku</h1>
          <p className="text-xl text-emerald-700/80 font-bold max-w-md mx-auto">Valloita YKI-testi tekoälyn voimalla.</p>
          
          {!hasKey && (
            <button onClick={handleOpenKeySelection} className="mt-8 px-8 py-3 bg-white text-emerald-700 font-black rounded-full border-2 border-emerald-200 shadow-lg hover:bg-emerald-50 transition-all">
              Määritä API-yhteys
            </button>
          )}
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {[TestLevel.PERUSTASO, TestLevel.KESKITASO].map(lvl => (
            <button 
              key={lvl}
              onClick={() => startTest(lvl)}
              disabled={loading}
              className="group relative bg-white p-12 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all border-4 border-transparent hover:border-emerald-400 text-left active:scale-95"
            >
              <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black mb-6 uppercase tracking-widest ${lvl === TestLevel.PERUSTASO ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-green-700'}`}>{lvl}</span>
              <h2 className="text-5xl font-black mb-4 text-slate-800">{lvl === TestLevel.PERUSTASO ? 'A1-A2' : 'B1-B2'}</h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                {lvl === TestLevel.PERUSTASO ? 'Perustason kokeen harjoittelu arkielämän tilanteisiin.' : 'Keskitason kokeen simulointi töitä ja kansalaisuutta varten.'}
              </p>
              {loading && level === lvl && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-[3rem] z-10">
                  <div className="w-14 h-14 border-6 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
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
        <div className="w-20 h-20 border-8 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-8"></div>
        <h2 className="text-4xl font-black text-emerald-900 tracking-tight">Rakennetaan koetta...</h2>
        <div className="mt-6 space-y-2">
          <p className="text-emerald-700 font-bold">Gemini-tekoäly luo tehtäviä tasolle {level}.</p>
          <p className="text-emerald-600/60 font-medium animate-pulse">Sisällön luominen voi kestää noin minuutin. Ole hyvä ja odota.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      <nav className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-emerald-100 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <button onClick={() => setLevel(null)} className="text-emerald-700 font-black text-3xl tracking-tighter hover:scale-105 transition-transform">SuomiPolku</button>
          
          <div className="flex gap-2 bg-emerald-50 p-1.5 rounded-2xl overflow-x-auto w-full md:w-auto">
            {partOrder.map(part => (
              <button
                key={part}
                onClick={() => setActivePart(part)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  activePart === part ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-700/60 hover:text-emerald-800'
                }`}
              >
                {renderPartIcon(part)}
                <span className="hidden sm:inline">{part}</span>
              </button>
            ))}
          </div>

          <button onClick={() => { setIsSubmitted(true); window.scrollTo({top:0, behavior:'smooth'}); }} className="px-8 py-3 bg-slate-900 text-white font-black rounded-full hover:bg-black transition-all text-sm shadow-xl">
            {isSubmitted ? 'UUSI KOE' : 'PALAUTA'}
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 md:p-8 mt-12">
        {activePart === TestPart.READING && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {test.reading.map((task, idx) => (
              <div key={idx} className="bg-white rounded-[3rem] shadow-xl border border-emerald-100 overflow-hidden">
                <div className="bg-emerald-900 p-10 text-white">
                  <h3 className="text-4xl font-black tracking-tight">{task.title}</h3>
                </div>
                <div className="p-10 md:p-16 space-y-12">
                  <p className="text-slate-700 leading-relaxed text-2xl font-medium whitespace-pre-wrap">{task.text}</p>
                  <div className="space-y-12 pt-12 border-t-2 border-emerald-50">
                    {task.questions.map(q => (
                      <div key={q.id} className="space-y-8">
                        <p className="font-black text-slate-900 text-2xl">{q.text}</p>
                        <div className="grid gap-4">
                          {q.options?.map(opt => (
                            <label key={opt} className={`flex items-center p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                              isSubmitted && opt === q.correctAnswer ? 'bg-emerald-50 border-emerald-500 shadow-md ring-4 ring-emerald-100' :
                              isSubmitted && userAnswers.reading[q.id] === opt ? 'bg-red-50 border-red-300' :
                              userAnswers.reading[q.id] === opt ? 'bg-emerald-50 border-emerald-400' : 'hover:bg-slate-50 border-slate-200'
                            }`}>
                              <input type="radio" name={q.id} checked={userAnswers.reading[q.id] === opt} onChange={() => setUserAnswers(p => ({...p, reading: {...p.reading, [q.id]: opt}}))} disabled={isSubmitted} className="w-6 h-6 text-emerald-600" />
                              <span className="ml-5 text-xl font-bold">{opt}</span>
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
          <div className="space-y-12 animate-in fade-in duration-500">
            {test.listening.map((task, idx) => (
              <div key={idx} className="bg-white rounded-[3rem] shadow-xl border border-emerald-100 p-10 md:p-16">
                <h3 className="text-3xl font-black text-emerald-900 mb-2 text-center">Kuuntelutehtävä {idx + 1}</h3>
                <AudioPlayer text={task.audioPrompt} variant="bar" />
                <div className="space-y-12 mt-12">
                  {task.questions.map(q => (
                    <div key={q.id} className="space-y-8">
                      <p className="font-black text-slate-900 text-2xl">{q.text}</p>
                      <div className="grid gap-4">
                        {q.options?.map(opt => (
                          <label key={opt} className={`flex items-center p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                            isSubmitted && opt === q.correctAnswer ? 'bg-emerald-50 border-emerald-500' :
                            userAnswers.listening[q.id] === opt ? 'bg-emerald-50 border-emerald-400' : 'hover:bg-slate-50 border-slate-200'
                          }`}>
                            <input type="radio" checked={userAnswers.listening[q.id] === opt} onChange={() => setUserAnswers(p => ({...p, listening: {...p.listening, [q.id]: opt}}))} disabled={isSubmitted} className="w-6 h-6 text-emerald-600" />
                            <span className="ml-5 text-xl font-bold">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {isSubmitted && <div className="mt-12 p-8 bg-emerald-50 rounded-3xl text-emerald-900 italic font-medium">{task.transcript}</div>}
              </div>
            ))}
          </div>
        )}

        {activePart === TestPart.WRITING && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {test.writing.map((task, idx) => (
              <div key={idx} className="bg-white rounded-[3rem] shadow-xl border border-emerald-100 p-10 md:p-16 space-y-10">
                <div className="bg-emerald-50 p-10 rounded-[2.5rem] border-2 border-emerald-100">
                  <h3 className="text-3xl font-black text-emerald-900 mb-2">{task.prompt}</h3>
                  <p className="text-emerald-700 font-bold">{task.context}</p>
                </div>
                <div className="relative">
                  <textarea
                    rows={12}
                    className="w-full p-10 border-4 border-slate-50 rounded-[2.5rem] focus:border-emerald-500 focus:ring-8 focus:ring-emerald-100 transition-all text-2xl font-medium outline-none bg-slate-50/30"
                    placeholder="Kirjoita tähän..."
                    value={userAnswers.writing[idx] || ""}
                    onChange={e => setUserAnswers(p => ({...p, writing: {...p.writing, [idx]: e.target.value}}))}
                    disabled={isSubmitted}
                  />
                  <div className="absolute bottom-6 right-10 text-slate-400 font-black text-sm">
                    {(userAnswers.writing[idx] || "").length} merkkiä
                  </div>
                </div>
                {isSubmitted && (
                  <div className="p-10 bg-emerald-900 text-white rounded-[2.5rem] shadow-inner">
                    <p className="font-black mb-4 text-xl uppercase tracking-widest text-emerald-300">Mallivastaus:</p>
                    <p className="text-2xl font-medium leading-relaxed">{task.sampleModelAnswer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activePart === TestPart.SPEAKING && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {test.speaking.map((task, idx) => (
              <div key={idx} className="bg-white rounded-[3rem] shadow-xl border border-emerald-100 p-10 md:p-16 text-center space-y-10">
                <h3 className="text-3xl font-black text-emerald-900">Puhetehtävä {idx + 1}</h3>
                <div className="bg-slate-50 p-12 rounded-[2.5rem] border-4 border-dashed border-emerald-100">
                  <p className="text-4xl font-black text-slate-800 mb-6">{task.prompt}</p>
                  <p className="text-2xl text-slate-500 font-bold leading-relaxed">{task.context}</p>
                </div>
                <div className="flex flex-col items-center gap-6 py-10">
                   <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                   </div>
                   <div className="space-y-2">
                     <p className="text-slate-600 font-black uppercase tracking-widest text-sm">Harjoittele ääneen</p>
                     <p className="text-slate-400 text-base font-bold italic">Koe on simulaatio – tallennusta ei tarvita.</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ala-navigointi */}
        <div className="mt-16 flex justify-between items-center px-4">
           <button 
             onClick={() => goToPart('prev')} 
             disabled={partOrder.indexOf(activePart) === 0}
             className="flex items-center gap-3 font-black text-emerald-700 disabled:opacity-20 hover:translate-x-[-8px] transition-all group"
           >
             <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
             </div>
             EDELLINEN OSA
           </button>
           
           <button 
             onClick={() => goToPart('next')} 
             disabled={partOrder.indexOf(activePart) === partOrder.length - 1}
             className="flex items-center gap-3 font-black text-emerald-700 disabled:opacity-20 hover:translate-x-[8px] transition-all group"
           >
             SEURAAVA OSA
             <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
             </div>
           </button>
        </div>
      </main>
    </div>
  );
};

export default App;
