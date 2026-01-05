
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
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({
    reading: {},
    listening: {},
    writing: { 0: "", 1: "" },
    speaking: { 0: null, 1: null }
  });

  const resetTest = () => {
    setLevel(null);
    setTest(null);
    setActivePart(TestPart.READING);
    setIsSubmitted(false);
    setUserAnswers({
      reading: {},
      listening: {},
      writing: { 0: "", 1: "" },
      speaking: { 0: null, 1: null }
    });
  };

  const startTest = async (selectedLevel: TestLevel) => {
    setLoading(true);
    setLevel(selectedLevel);
    try {
      const generated = await generateTestContent(selectedLevel);
      setTest(generated);
    } catch (err) {
      console.error("Error starting test:", err);
      alert("Testin luominen epäonnistui. Tämä johtuu yleensä API-avainvirheestä tai mallin rajoituksista. Yritä hetken kuluttua uudelleen.");
      setLevel(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (part: 'reading' | 'listening', qId: string, val: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [part]: { ...prev[part], [qId]: val }
    }));
  };

  const handleWritingChange = (index: number, val: string) => {
    setUserAnswers(prev => ({
      ...prev,
      writing: { ...prev.writing, [index]: val }
    }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!level) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-black text-blue-900 mb-4 tracking-tighter drop-shadow-sm">SuomiPolku</h1>
          <p className="text-xl text-slate-600 font-semibold max-w-md mx-auto">Simuloitu YKI-testi – harjoittele suomen kielen taitojasi missä vain.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          <button 
            onClick={() => startTest(TestLevel.PERUSTASO)}
            disabled={loading}
            className="group relative bg-white p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-400 active:scale-95 text-left"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-black mb-6">TASO: ALKEET</span>
            <h2 className="text-4xl font-black mb-3 text-slate-800">Perustaso</h2>
            <p className="text-slate-500 leading-relaxed text-lg">YKI-testin tasot 1 ja 2. Sopii arkipäivän tilanteisiin.</p>
            {loading && level === TestLevel.PERUSTASO && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-[2.5rem] z-10">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-blue-600">Luodaan kysymyksiä...</p>
              </div>
            )}
          </button>

          <button 
            onClick={() => startTest(TestLevel.KESKITASO)}
            disabled={loading}
            className="group relative bg-white p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-indigo-400 active:scale-95 text-left"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-black mb-6">TASO: EDISTYNYT</span>
            <h2 className="text-4xl font-black mb-3 text-slate-800">Keskitaso</h2>
            <p className="text-slate-500 leading-relaxed text-lg">YKI-testin tasot 3 ja 4. Sopii työhön ja kansalaisuuteen.</p>
            {loading && level === TestLevel.KESKITASO && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-[2.5rem] z-10">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-indigo-600">Generoidaan tekstejä...</p>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (loading || !test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6 bg-slate-50 text-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-8 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div>
          <p className="text-3xl font-black text-slate-800 tracking-tight">Valmistellaan koetta</p>
          <p className="text-slate-500 mt-2 font-medium">Tämä voi kestää hetken – tekoäly rakentaa testin juuri sinulle.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Navigation Bar */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-50 px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={resetTest} 
              className="text-blue-600 hover:text-blue-800 font-black text-2xl tracking-tighter active:scale-90 transition-transform"
              title="Palaa alkuun"
            >
              SuomiPolku
            </button>
            <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest">
              {level}
            </span>
          </div>
          
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl overflow-x-auto w-full md:w-auto">
            {Object.values(TestPart).map(part => (
              <button
                key={part}
                onClick={() => setActivePart(part)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-wider ${
                  activePart === part ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {part}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {!isSubmitted ? (
              <button 
                onClick={handleSubmit}
                className="px-8 py-2.5 bg-blue-600 text-white font-black rounded-full hover:bg-blue-700 transition-all shadow-lg active:scale-95 text-sm"
              >
                PALAUTA
              </button>
            ) : (
              <button 
                onClick={resetTest}
                className="px-8 py-2.5 bg-slate-800 text-white font-black rounded-full hover:bg-black transition-all shadow-lg active:scale-95 text-sm"
              >
                UUSI TESTI
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-12">
        {/* Results Banner */}
        {isSubmitted && (
          <div className="bg-green-100 border-l-[12px] border-green-500 p-8 rounded-3xl shadow-xl shadow-green-900/5 animate-in fade-in slide-in-from-top duration-500">
            <h2 className="text-3xl font-black text-green-900 mb-2 tracking-tight">Koe on valmis!</h2>
            <p className="text-green-800 font-bold text-lg">Hienoa työtä. Katso alta palaute ja oikeat vastaukset.</p>
          </div>
        )}

        {/* Reading Section */}
        {activePart === TestPart.READING && (
          <section className="space-y-12 animate-in fade-in duration-300">
            {test.reading.map((task, taskIdx) => (
              <div key={taskIdx} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-8 border-b border-slate-200">
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">{task.title}</h3>
                </div>
                <div className="p-8 md:p-14 space-y-10">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-slate-700 leading-relaxed text-xl whitespace-pre-wrap font-medium">{task.text}</p>
                  </div>
                  
                  <div className="space-y-10 pt-10 border-t border-slate-100">
                    {task.questions.map((q) => (
                      <div key={q.id} className="space-y-6">
                        <p className="font-black text-slate-900 text-xl tracking-tight leading-snug">{q.text}</p>
                        <div className="grid grid-cols-1 gap-4">
                          {q.options?.map((opt, i) => {
                            const isCorrect = isSubmitted && opt === q.correctAnswer;
                            const isUserSelection = userAnswers.reading[q.id] === opt;
                            const isIncorrectSelection = isSubmitted && isUserSelection && opt !== q.correctAnswer;

                            return (
                              <label key={i} className={`flex items-center p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                                isCorrect ? 'bg-green-50 border-green-500 shadow-md scale-[1.02]' :
                                isIncorrectSelection ? 'bg-red-50 border-red-500 shadow-sm' :
                                isUserSelection ? 'bg-blue-50 border-blue-400' :
                                'hover:bg-slate-50 border-slate-200'
                              }`}>
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={opt}
                                  disabled={isSubmitted}
                                  checked={isUserSelection}
                                  onChange={() => handleAnswerChange('reading', q.id, opt)}
                                  className="w-6 h-6 text-blue-600 focus:ring-blue-500"
                                />
                                <span className={`ml-5 text-lg ${isCorrect ? 'font-black text-green-900' : isIncorrectSelection ? 'text-red-900 font-bold' : 'text-slate-700 font-semibold'}`}>
                                  {opt}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {isSubmitted && task.sampleModelAnswer && (
                    <div className="mt-12 p-10 bg-blue-50 rounded-[2rem] border-2 border-blue-100 shadow-inner">
                      <h4 className="font-black text-blue-900 mb-4 text-xl tracking-tight uppercase">Vinkki & Selitys:</h4>
                      <p className="text-blue-800 italic text-xl leading-relaxed">{task.sampleModelAnswer}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Listening Section */}
        {activePart === TestPart.LISTENING && (
          <section className="space-y-12 animate-in fade-in duration-300">
            {test.listening.map((task, taskIdx) => (
              <div key={taskIdx} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 p-10 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Kuuntelu {taskIdx + 1}</h3>
                    <p className="text-slate-500 mt-2 font-bold uppercase text-xs tracking-widest">Paina nappia aloittaaksesi</p>
                  </div>
                  <AudioPlayer text={task.audioPrompt} />
                </div>
                <div className="p-8 md:p-14 space-y-14">
                  <div className="space-y-12">
                    {task.questions.map((q) => (
                      <div key={q.id} className="space-y-6">
                        <div className="flex items-start gap-5">
                           <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-xl rotate-3">?</span>
                           <p className="font-black text-slate-900 text-2xl pt-1 tracking-tight">{q.text}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 ml-16">
                          {q.options?.map((opt, i) => {
                            const isCorrect = isSubmitted && opt === q.correctAnswer;
                            const isUserSelection = userAnswers.listening[q.id] === opt;
                            const isIncorrectSelection = isSubmitted && isUserSelection && opt !== q.correctAnswer;

                            return (
                              <label key={i} className={`flex items-center p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                                isCorrect ? 'bg-green-50 border-green-500 ring-8 ring-green-100' :
                                isIncorrectSelection ? 'bg-red-50 border-red-500' :
                                isUserSelection ? 'bg-blue-50 border-blue-500 shadow-md' :
                                'hover:bg-slate-50 border-slate-200'
                              }`}>
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={opt}
                                  disabled={isSubmitted}
                                  checked={isUserSelection}
                                  onChange={() => handleAnswerChange('listening', q.id, opt)}
                                  className="w-7 h-7 text-blue-600"
                                />
                                <span className={`ml-5 text-xl ${isCorrect ? 'font-black text-green-900' : isIncorrectSelection ? 'text-red-900 font-bold' : 'text-slate-700 font-bold'}`}>
                                  {opt}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {isSubmitted && (
                    <div className="mt-16 p-12 bg-slate-50 rounded-[2.5rem] border-2 border-slate-200 shadow-inner">
                      <h4 className="flex items-center gap-4 font-black text-slate-900 mb-8 text-2xl tracking-tight">
                        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414(5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Nauhoitteen teksti:
                      </h4>
                      <p className="text-slate-800 italic leading-relaxed whitespace-pre-wrap text-2xl bg-white p-10 rounded-3xl border-2 border-slate-100 font-medium">
                        {task.transcript}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Writing Section */}
        {activePart === TestPart.WRITING && (
          <section className="space-y-12 animate-in fade-in duration-300">
            {test.writing.map((task, taskIdx) => (
              <div key={taskIdx} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-8 border-b border-slate-200">
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">Kirjoittaminen {taskIdx + 1}</h3>
                </div>
                <div className="p-8 md:p-14 space-y-10">
                  <div className="bg-blue-50 p-8 rounded-3xl border-2 border-blue-100 text-blue-900 shadow-sm">
                    <p className="font-black text-3xl mb-3 tracking-tight">{task.prompt}</p>
                    <p className="text-blue-700 font-bold text-lg">{task.context}</p>
                  </div>
                  
                  <textarea
                    rows={12}
                    className="w-full p-10 border-2 border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 disabled:bg-slate-50 text-2xl transition-all leading-relaxed font-medium shadow-inner"
                    placeholder="Kirjoita tähän vastauksesi..."
                    disabled={isSubmitted}
                    value={userAnswers.writing[taskIdx]}
                    onChange={(e) => handleWritingChange(taskIdx, e.target.value)}
                  />

                  {isSubmitted && (
                    <div className="mt-14 p-12 bg-green-50 rounded-[2.5rem] border-2 border-green-200 shadow-2xl shadow-green-900/10 scale-[1.01]">
                      <div className="flex items-center gap-4 mb-8">
                        <span className="w-12 h-12 rounded-2xl bg-green-200 flex items-center justify-center shadow-md rotate-2">
                           <svg className="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </span>
                        <h4 className="font-black text-green-900 text-3xl tracking-tight">Mallivastaus</h4>
                      </div>
                      <div className="text-green-900 whitespace-pre-wrap leading-relaxed text-2xl bg-white/80 p-10 rounded-3xl border-2 border-green-100 font-medium">
                        {task.sampleModelAnswer}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Speaking Section */}
        {activePart === TestPart.SPEAKING && (
          <section className="space-y-12 animate-in fade-in duration-300">
            {test.speaking.map((task, taskIdx) => (
              <div key={taskIdx} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-8 border-b border-slate-200">
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">Puhuminen {taskIdx + 1}</h3>
                </div>
                <div className="p-8 md:p-14 space-y-10">
                  <div className="bg-indigo-50 p-10 rounded-3xl border-2 border-indigo-100 text-indigo-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                    <div className="flex-1">
                      <p className="font-black text-3xl mb-3 tracking-tight">{task.prompt}</p>
                      <p className="text-indigo-700 font-bold text-lg leading-relaxed">{task.context}</p>
                    </div>
                    <div className="flex-shrink-0">
                       <AudioPlayer text={task.prompt} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-20 border-4 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 group hover:border-blue-300 transition-all hover:bg-white">
                    <button className="p-14 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:scale-110 transition-all mb-10 shadow-2xl active:scale-95 border-8 border-white ring-4 ring-red-50">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                    </button>
                    <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-lg">Puhu nyt</p>
                    <p className="text-slate-400 text-base mt-4 font-bold">Äänitystä ei tallenneta – harjoittele vapaasti.</p>
                  </div>

                  {isSubmitted && (
                    <div className="mt-14 p-12 bg-indigo-50/50 rounded-[2.5rem] border-2 border-indigo-100 shadow-sm">
                      <h4 className="font-black text-indigo-900 mb-6 flex items-center gap-4 text-2xl tracking-tight">
                        <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Palaute ja itsearviointi:
                      </h4>
                      <div className="space-y-6 text-indigo-900 text-xl leading-relaxed font-medium">
                        <p>Kokeile puhua vastaus uudelleen ja kiinnitä huomiota:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <li className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-3">
                            <span className="w-3 h-3 bg-indigo-500 rounded-full"></span> Ääntäminen
                          </li>
                          <li className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-3">
                            <span className="w-3 h-3 bg-indigo-500 rounded-full"></span> Sujuvuus
                          </li>
                          <li className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-3">
                            <span className="w-3 h-3 bg-indigo-500 rounded-full"></span> Rakenteet
                          </li>
                          <li className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-3">
                            <span className="w-3 h-3 bg-indigo-500 rounded-full"></span> Sanasto
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* Footer Nav Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-6 md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{activePart}</span>
          {!isSubmitted ? (
            <button 
              onClick={handleSubmit}
              className="px-12 py-4 bg-blue-600 text-white font-black rounded-full shadow-xl active:scale-95 transition-all text-sm uppercase tracking-wider"
            >
              Palauta
            </button>
          ) : (
            <button 
              onClick={resetTest}
              className="px-12 py-4 bg-slate-800 text-white font-black rounded-full shadow-xl active:scale-95 transition-all text-sm uppercase tracking-wider"
            >
              Alkuun
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
