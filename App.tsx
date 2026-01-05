
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
      alert("Testin luominen epäonnistui. Tarkista API-avain.");
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
          <h1 className="text-5xl font-extrabold text-blue-900 mb-4 tracking-tight">SuomiPolku</h1>
          <p className="text-xl text-slate-600 font-medium">Simuloitu YKI-testi kielenoppijoille</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          <button 
            onClick={() => startTest(TestLevel.PERUSTASO)}
            disabled={loading}
            className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-400 active:scale-95"
          >
            <div className="text-left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-4">A1 - A2</span>
              <h2 className="text-3xl font-bold mb-2 text-slate-800">Perustaso</h2>
              <p className="text-slate-500 leading-relaxed">Sopii aloittelijoille ja jokapäiväiseen kielenkäyttöön.</p>
            </div>
            {loading && level === TestLevel.PERUSTASO && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-3xl">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>

          <button 
            onClick={() => startTest(TestLevel.KESKITASO)}
            disabled={loading}
            className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-indigo-400 active:scale-95"
          >
            <div className="text-left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold mb-4">B1 - B2</span>
              <h2 className="text-3xl font-bold mb-2 text-slate-800">Keskitaso</h2>
              <p className="text-slate-500 leading-relaxed">Sopii työhön, opintoihin ja Suomen kansalaisuuden hakemiseen.</p>
            </div>
            {loading && level === TestLevel.KESKITASO && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-3xl">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (loading || !test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
        <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800">Valmistellaan testiä...</p>
          <p className="text-slate-500 mt-2">Haetaan kysymyksiä ja generoidaan materiaalia.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Navigation Bar */}
      <nav className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-10 px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={resetTest} 
              className="text-blue-600 hover:text-blue-800 font-black text-2xl tracking-tighter"
            >
              SuomiPolku
            </button>
            <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest">
              {level}
            </span>
          </div>
          
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl overflow-x-auto w-full md:w-auto">
            {Object.values(TestPart).map(part => (
              <button
                key={part}
                onClick={() => setActivePart(part)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  activePart === part ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {part}
              </button>
            ))}
          </div>

          {!isSubmitted && (
            <button 
              onClick={handleSubmit}
              className="px-8 py-2 bg-blue-600 text-white font-black rounded-full hover:bg-blue-700 transition-all shadow-lg active:scale-95"
            >
              Palauta testi
            </button>
          )}
          {isSubmitted && (
            <button 
              onClick={resetTest}
              className="px-8 py-2 bg-slate-800 text-white font-black rounded-full hover:bg-black transition-all shadow-lg active:scale-95"
            >
              Uusi testi
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        {/* Results Banner */}
        {isSubmitted && (
          <div className="bg-green-100 border-l-8 border-green-500 p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-black text-green-900 mb-2">Testi palautettu!</h2>
            <p className="text-green-800 font-medium">Olet valmis. Katso tulokset ja mallivastaukset kunkin osion alta.</p>
          </div>
        )}

        {/* Reading Section */}
        {activePart === TestPart.READING && (
          <section className="space-y-12">
            {test.reading.map((task, taskIdx) => (
              <div key={taskIdx} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-8 border-b border-slate-200">
                  <h3 className="text-2xl font-black text-slate-800">{task.title}</h3>
                </div>
                <div className="p-8 md:p-12 space-y-10">
                  <p className="text-slate-700 leading-relaxed text-xl whitespace-pre-wrap font-serif">{task.text}</p>
                  
                  <div className="space-y-8">
                    {task.questions.map((q) => (
                      <div key={q.id} className="space-y-4">
                        <p className="font-bold text-slate-900 text-lg">{q.text}</p>
                        <div className="grid grid-cols-1 gap-3">
                          {q.options?.map((opt, i) => {
                            const isCorrect = isSubmitted && opt === q.correctAnswer;
                            const isUserSelection = userAnswers.reading[q.id] === opt;
                            const isIncorrectSelection = isSubmitted && isUserSelection && opt !== q.correctAnswer;

                            return (
                              <label key={i} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                isCorrect ? 'bg-green-50 border-green-500' :
                                isIncorrectSelection ? 'bg-red-50 border-red-500' :
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
                                  className="w-5 h-5 text-blue-600"
                                />
                                <span className={`ml-4 ${isCorrect ? 'font-black text-green-900' : isIncorrectSelection ? 'text-red-900 font-bold' : 'text-slate-700'}`}>
                                  {opt}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {isSubmitted && (task.sampleModelAnswer) && (
                    <div className="mt-12 p-8 bg-blue-50 rounded-2xl border-2 border-blue-100">
                      <h4 className="font-black text-blue-900 mb-3 text-lg">Mallivastaus / Selitys:</h4>
                      <p className="text-blue-800 italic text-lg leading-relaxed">{task.sampleModelAnswer}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Listening Section */}
        {activePart === TestPart.LISTENING && (
          <section className="space-y-12">
            {test.listening.map((task, taskIdx) => (
              <div key={taskIdx} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 p-8 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">Kuuntelutehtävä {taskIdx + 1}</h3>
                    <p className="text-slate-500 mt-2 font-medium">Kuuntele nauhoite ja vastaa alla oleviin kysymyksiin.</p>
                  </div>
                  <AudioPlayer text={task.audioPrompt} />
                </div>
                <div className="p-8 md:p-12 space-y-12">
                  <div className="space-y-10">
                    {task.questions.map((q) => (
                      <div key={q.id} className="space-y-4">
                        <div className="flex items-start gap-4">
                           <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md">?</span>
                           <p className="font-bold text-slate-900 text-xl pt-1">{q.text}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 ml-14">
                          {q.options?.map((opt, i) => {
                            const isCorrect = isSubmitted && opt === q.correctAnswer;
                            const isUserSelection = userAnswers.listening[q.id] === opt;
                            const isIncorrectSelection = isSubmitted && isUserSelection && opt !== q.correctAnswer;

                            return (
                              <label key={i} className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                isCorrect ? 'bg-green-50 border-green-500 ring-4 ring-green-100' :
                                isIncorrectSelection ? 'bg-red-50 border-red-500' :
                                isUserSelection ? 'bg-blue-50 border-blue-500' :
                                'hover:bg-slate-50 border-slate-200'
                              }`}>
                                <input
                                  type="radio"
                                  name={q.id}
                                  value={opt}
                                  disabled={isSubmitted}
                                  checked={isUserSelection}
                                  onChange={() => handleAnswerChange('listening', q.id, opt)}
                                  className="w-6 h-6 text-blue-600"
                                />
                                <span className={`ml-4 text-lg ${isCorrect ? 'font-black text-green-900' : isIncorrectSelection ? 'text-red-900 font-bold' : 'text-slate-700 font-semibold'}`}>
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
                    <div className="mt-16 p-10 bg-slate-50 rounded-3xl border-2 border-slate-200 shadow-inner">
                      <h4 className="flex items-center gap-3 font-black text-slate-900 mb-6 text-xl">
                        <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Kuuntelun teksti (Transcript):
                      </h4>
                      <p className="text-slate-800 italic leading-relaxed whitespace-pre-wrap text-xl bg-white p-8 rounded-2xl border-2 border-slate-200 font-serif">
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
          <section className="space-y-12">
            {test.writing.map((task, taskIdx) => (
              <div key={taskIdx} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-8 border-b border-slate-200">
                  <h3 className="text-2xl font-black text-slate-800">Kirjoitustehtävä {taskIdx + 1}</h3>
                </div>
                <div className="p-8 md:p-12 space-y-8">
                  <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 text-blue-900">
                    <p className="font-black text-2xl mb-2">{task.prompt}</p>
                    <p className="text-blue-700 font-medium">{task.context}</p>
                  </div>
                  
                  <textarea
                    rows={12}
                    className="w-full p-8 border-2 border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 text-xl transition-all leading-relaxed font-serif shadow-inner"
                    placeholder="Kirjoita vastauksesi tähän suomeksi..."
                    disabled={isSubmitted}
                    value={userAnswers.writing[taskIdx]}
                    onChange={(e) => handleWritingChange(taskIdx, e.target.value)}
                  />

                  {isSubmitted && (
                    <div className="mt-12 p-10 bg-green-50 rounded-3xl border-2 border-green-200 shadow-xl shadow-green-900/5">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center shadow-sm">
                           <svg className="w-6 h-6 text-green-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </span>
                        <h4 className="font-black text-green-900 text-2xl underline decoration-green-300 underline-offset-8">Mallivastaus (Model Answer):</h4>
                      </div>
                      <div className="text-green-900 whitespace-pre-wrap leading-relaxed text-xl bg-white/70 p-8 rounded-2xl border-2 border-green-100/50 font-serif">
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
          <section className="space-y-12">
            {test.speaking.map((task, taskIdx) => (
              <div key={taskIdx} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-8 border-b border-slate-200">
                  <h3 className="text-2xl font-black text-slate-800">Puhetehtävä {taskIdx + 1}</h3>
                </div>
                <div className="p-8 md:p-12 space-y-8">
                  <div className="bg-indigo-50 p-8 rounded-3xl border-2 border-indigo-100 text-indigo-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex-1">
                      <p className="font-black text-2xl mb-2">{task.prompt}</p>
                      <p className="text-indigo-700 font-medium leading-relaxed">{task.context}</p>
                    </div>
                    <div className="flex-shrink-0">
                       <AudioPlayer text={task.prompt} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-16 border-4 border-dashed border-slate-200 rounded-3xl bg-slate-50 group hover:border-blue-300 transition-all">
                    <button className="p-10 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:scale-110 transition-all mb-8 shadow-xl active:scale-95 border-4 border-white">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                    </button>
                    <p className="text-slate-500 font-black uppercase tracking-widest text-base">Klikkaa mikrofonista nauhoittaaksesi</p>
                    <p className="text-slate-400 text-sm mt-3 font-medium">(Simulaatio: harjoittele vastaamista ääneen)</p>
                  </div>

                  {isSubmitted && (
                    <div className="mt-12 p-10 bg-slate-100 rounded-3xl border-2 border-slate-200">
                      <h4 className="font-black text-slate-900 mb-4 flex items-center gap-3 text-xl">
                        <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Itsearviointi ja vinkit:
                      </h4>
                      <div className="space-y-4 text-slate-800 text-lg leading-relaxed">
                        <p>Oikeassa testissä arvioijat kiinnittävät huomiota:</p>
                        <ul className="list-disc ml-8 space-y-2 font-medium">
                          <li>Ääntäminen ja painotus</li>
                          <li>Sujuva puherytmi (ei liian pitkiä taukoja)</li>
                          <li>Kieliopin hallinta (esim. sija-astevaihtelut)</li>
                          <li>Sanaston monipuolisuus</li>
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

      {/* Floating Controls Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-5 md:hidden shadow-2xl z-20">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{activePart}</span>
          {!isSubmitted ? (
            <button 
              onClick={handleSubmit}
              className="px-10 py-3 bg-blue-600 text-white font-black rounded-full shadow-lg active:scale-95 transition-all"
            >
              Palauta
            </button>
          ) : (
            <button 
              onClick={resetTest}
              className="px-10 py-3 bg-slate-800 text-white font-black rounded-full shadow-lg active:scale-95 transition-all"
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
