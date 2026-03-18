
import React from 'react';

interface SleepModeSwitchProps {
  isWorkMode: boolean;
  onToggle: () => void;
  scale?: number;
}

const SleepModeSwitch: React.FC<SleepModeSwitchProps> = ({ isWorkMode, onToggle, scale = 1 }) => {
  const width = 150 * scale;
  const height = 195 * scale;

  return (
    <div style={{ width: width, height: height, position: 'relative', display: 'inline-block' }} className="mx-2" title={isWorkMode ? "Enter Sleep Mode" : "Wake Up"}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0', position: 'absolute', top: 0, left: 0, width: 150, height: 195 }}>
      <style>{`
        .sleep-switch-container .switch {
            display: block;
            background-color: black;
            width: 150px;
            height: 195px;
            box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.2), 0 0 1px 2px black, inset 0 2px 2px -2px white, inset 0 0 2px 15px #47434c, inset 0 0 2px 22px black;
            border-radius: 5px;
            padding: 20px;
            perspective: 700px;
        }

        .sleep-switch-container .switch input {
            display: none;
        }

        .sleep-switch-container .switch input:checked + .button {
            transform: translateZ(20px) rotateX(25deg);
            box-shadow: 0 -10px 20px #1cff42;
        }

        .sleep-switch-container .switch input:checked + .button .light {
            animation: flicker 0.2s infinite 0.3s;
        }

        .sleep-switch-container .switch input:checked + .button .shine {
            opacity: 1;
        }

        .sleep-switch-container .switch input:checked + .button .shadow {
            opacity: 0;
        }

        .sleep-switch-container .switch .button {
            display: block;
            transition: all 0.3s cubic-bezier(1, 0, 1, 1);
            transform-origin: center center -20px;
            transform: translateZ(20px) rotateX(-25deg);
            transform-style: preserve-3d;
            background-color: #9b0621;
            height: 100%;
            position: relative;
            cursor: pointer;
            background: linear-gradient(#9b0621 0%, #5e0002 30%, #630000 70%, #8a0303 100%);
            box-shadow: 0 10px 20px #ff0000;
            background-repeat: no-repeat;
        }
        
        .sleep-switch-container .switch input:checked + .button {
            background-color: #03a614;
            background: linear-gradient(#02961d 0%, #005e02 30%, #006300 70%, #009100 100%);
        }

        .sleep-switch-container .switch .button::before {
            content: "";
            background: linear-gradient(rgba(255, 255, 255, 0.8) 10%, rgba(255, 255, 255, 0.3) 30%, #650000 75%, #320000) 50% 50%/97% 97%, #b30000;
            background-repeat: no-repeat;
            width: 100%;
            height: 50px;
            transform-origin: top;
            transform: rotateX(-90deg);
            position: absolute;
            top: 0;
        }
        
        .sleep-switch-container .switch input:checked + .button::before {
            background: linear-gradient(rgba(255, 255, 255, 0.8) 10%, rgba(255, 255, 255, 0.3) 30%, #055c00 75%, #022e00) 50% 50%/97% 97%, #00b00f;
        }

        .sleep-switch-container .switch .button::after {
            content: "";
            background-image: linear-gradient(#650000, #320000);
            width: 100%;
            height: 50px;
            transform-origin: top;
            transform: translateY(50px) rotateX(-90deg);
            position: absolute;
            bottom: 0;
            box-shadow: 0 50px 8px 0px black, 0 80px 20px 0px rgba(0, 0, 0, 0.5);
        }
        
        .sleep-switch-container .switch input:checked + .button::after {
            background-image: linear-gradient(#006600, #003008);
        }

        .sleep-switch-container .switch .light {
            opacity: 0;
            animation: light-off 1s;
            position: absolute;
            width: 100%;
            height: 100%;
            background-image: radial-gradient(#7dff83, #1bff17 40%, transparent 70%);
        }

        .sleep-switch-container .switch .dots {
            position: absolute;
            width: 100%;
            height: 100%;
            background-image: radial-gradient(transparent 30%, rgba(120, 0, 0, 0.7) 70%);
            background-size: 10px 10px;
        }
        
        .sleep-switch-container .switch input:checked + .button .dots {
            background-image: radial-gradient(transparent 30%, rgba(6, 97, 0, 0.7) 70%);
        }

        .sleep-switch-container .switch .characters {
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(white, white) 50% 20%/5% 20%, radial-gradient(circle, transparent 50%, white 52%, white 70%, transparent 72%) 50% 80%/33% 25%;
            background-repeat: no-repeat;
        }

        .sleep-switch-container .switch .shine {
            transition: all 0.3s cubic-bezier(1, 0, 1, 1);
            opacity: 0.3;
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(white, transparent 3%) 50% 50%/97% 97%, linear-gradient(rgba(255, 255, 255, 0.5), transparent 50%, transparent 80%, rgba(255, 255, 255, 0.5)) 50% 50%/97% 97%;
            background-repeat: no-repeat;
        }

        .sleep-switch-container .switch .shadow {
            transition: all 0.3s cubic-bezier(1, 0, 1, 1);
            opacity: 1;
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(transparent 70%, rgba(0, 0, 0, 0.8));
            background-repeat: no-repeat;
        }

        @keyframes flicker {
            0% { opacity: 1; }
            80% { opacity: 0.8; }
            100% { opacity: 1; }
        }

        @keyframes light-off {
            0% { opacity: 1; }
            80% { opacity: 0; }
        }
      `}</style>
      <div className="sleep-switch-container">
        <label className="switch">
          <input type="checkbox" checked={isWorkMode} onChange={onToggle} />
          <div className="button">
            <div className="light" />
            <div className="dots" />
            <div className="shadow" />
            <div className="characters" />
            <div className="shine" />
          </div>
        </label>
      </div>
      </div>
    </div>
  );
};

export default SleepModeSwitch;
