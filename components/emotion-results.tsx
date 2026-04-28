type EmotionScore = {
    label: string;
    score: number;
};

type EmotionResultsProps = {
    emotion: string;
    confidence: number;
    scores: EmotionScore[];
};

export function EmotionResults({
    emotion,
    confidence,
    scores,
}: EmotionResultsProps) {
    return (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-zinc-400">Prediction result</p>
                <p className="text-sm text-zinc-300">
                    Confidence:{" "}
                    <span className="text-white">
                        {(confidence * 100).toFixed(1)}%
                    </span>
                </p>
            </div>

            <p className="mb-5 text-2xl font-bold text-white">{emotion}</p>

            <div className="space-y-3">
                {scores.map((item) => (
                    <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between text-xs text-zinc-300">
                            <span>{item.label}</span>
                            <span>{(item.score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-800">
                            <div
                                className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                                style={{
                                    width: `${Math.max(0, Math.min(100, item.score * 100))}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
