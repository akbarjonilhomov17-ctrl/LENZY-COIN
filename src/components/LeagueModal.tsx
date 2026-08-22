import React from 'react';
import { X, Trophy, CheckCircle, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import { League, UserGameState } from '../types';
import { LEAGUES } from '../utils/constants';
import { formatCoins, formatNumberWithCommas } from '../utils/storage';

interface LeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLeague: League;
  totalEarnedCoins: number;
}

export const LeagueModal: React.FC<LeagueModalProps> = ({
  isOpen,
  onClose,
  currentLeague,
  totalEarnedCoins
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl relative select-none max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center pt-1 pb-3 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 mx-auto mb-2 flex items-center justify-center shadow-xl shadow-amber-500/20">
            <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-2xl">
              {currentLeague.icon}
            </div>
          </div>
          <h3 className="text-lg font-black text-slate-100">{currentLeague.nameUz} Ligasidasiz</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Jami to&apos;plangan: <strong className="text-amber-400">{formatNumberWithCommas(totalEarnedCoins)}</strong> tanga
          </p>
        </div>

        {/* Leagues List */}
        <div className="space-y-2 overflow-y-auto pr-1 flex-1">
          {LEAGUES.map((league) => {
            const isUnlocked = totalEarnedCoins >= league.minCoins;
            const isCurrent = league.id === currentLeague.id;

            return (
              <div
                key={league.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-amber-950/50 to-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10'
                    : isUnlocked
                    ? 'bg-slate-900/60 border-slate-800/80'
                    : 'bg-slate-950/40 border-slate-850 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-xl shrink-0">
                    {league.icon}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-100">{league.nameUz}</span>
                      {isCurrent && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-bold">
                          HOZIRGI
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {league.minCoins === 0 ? 'Boshlang\'ich daraja' : `${formatCoins(league.minCoins)}+ tangadan boshlab`}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {isUnlocked ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Ochilgan
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium">
                      Qulflangan
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-2 border-t border-slate-800 shrink-0 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            Tushundim
          </button>
        </div>
      </div>
    </div>
  );
};
