"use client";

interface RecordingCharacterProps {
  isRecording: boolean;
}

export function RecordingCharacter({ isRecording }: RecordingCharacterProps) {
  return (
    <div className="flex flex-col items-center">
      <div className={`relative transition-transform duration-300 ${isRecording ? "scale-105" : "scale-100"}`}>
        <svg
          width="120"
          height="140"
          viewBox="0 0 120 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Body */}
          <ellipse cx="60" cy="105" rx="30" ry="28" fill="#FCD34D" />
          {/* Head */}
          <circle cx="60" cy="58" r="32" fill="#FCD34D" />
          {/* Eyes */}
          <ellipse cx="50" cy="54" rx="5" ry="6" fill="white" />
          <ellipse cx="70" cy="54" rx="5" ry="6" fill="white" />
          {/* Pupils */}
          <circle
            cx={isRecording ? "52" : "51"}
            cy={isRecording ? "55" : "55"}
            r="3"
            fill="#1E293B"
          />
          <circle
            cx={isRecording ? "72" : "71"}
            cy={isRecording ? "55" : "55"}
            r="3"
            fill="#1E293B"
          />
          {/* Eye shine */}
          <circle cx="52" cy="52" r="1.5" fill="white" />
          <circle cx="72" cy="52" r="1.5" fill="white" />
          {/* Mouth */}
          {isRecording ? (
            /* Open excited mouth */
            <ellipse cx="60" cy="68" rx="10" ry="7" fill="#F97316" />
          ) : (
            /* Smile */
            <path
              d="M 50 67 Q 60 76 70 67"
              stroke="#F97316"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          )}
          {/* Cheeks */}
          <ellipse cx="43" cy="65" rx="6" ry="4" fill="#FCA5A5" opacity="0.7" />
          <ellipse cx="77" cy="65" rx="6" ry="4" fill="#FCA5A5" opacity="0.7" />
          {/* Arms */}
          <path
            d={isRecording ? "M 32 100 Q 20 85 25 75" : "M 32 100 Q 18 90 22 80"}
            stroke="#FCD34D"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={isRecording ? "M 88 100 Q 100 85 95 75" : "M 88 100 Q 102 90 98 80"}
            stroke="#FCD34D"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          {/* Headphone */}
          <path d="M 32 55 Q 30 30 60 26 Q 90 30 88 55" stroke="#6366F1" strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="27" y="52" width="10" height="14" rx="4" fill="#6366F1" />
          <rect x="83" y="52" width="10" height="14" rx="4" fill="#6366F1" />
        </svg>

        {/* Sound waves when recording */}
        {isRecording && (
          <div className="absolute -right-2 top-8 flex flex-col gap-1">
            {[12, 20, 14].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-blue-400 rounded-full animate-pulse"
                style={{
                  height: `${h}px`,
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
