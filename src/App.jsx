import { useState } from 'react';
import { Users, UserPlus, Play, Trash2, Shuffle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [phase, setPhase] = useState('setup'); 
  
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCapacity, setNewTeamCapacity] = useState(5);
  const [newTeamCompanionLimit, setNewTeamCompanionLimit] = useState(2);

  const [mainName, setMainName] = useState('');
  const [companionCount, setCompanionCount] = useState(0);
  const [companionNames, setCompanionNames] = useState([]);
  const [drawResult, setDrawResult] = useState(null);

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    setTeams([...teams, { 
      id: Date.now(), 
      name: newTeamName.trim(), 
      capacity: parseInt(newTeamCapacity) || 1,
      companionLimit: parseInt(newTeamCompanionLimit) || 0,
      members: [] 
    }]);
    setNewTeamName('');
  };

  const handleRemoveTeam = (id) => {
    setTeams(teams.filter(t => t.id !== id));
  };

  const handleCompanionCountChange = (e) => {
    const count = parseInt(e.target.value) || 0;
    setCompanionCount(count);
    
    const newNames = [...companionNames];
    if (count > newNames.length) {
      for (let i = newNames.length; i < count; i++) {
        newNames.push('');
      }
    } else {
      newNames.splice(count);
    }
    setCompanionNames(newNames);
  };

  const handleCompanionNameChange = (index, value) => {
    const newNames = [...companionNames];
    newNames[index] = value;
    setCompanionNames(newNames);
  };

  const handleDraw = () => {
    if (!mainName.trim()) {
      alert('請輸入主要抽籤者姓名！');
      return;
    }
    if (companionCount > 0 && companionNames.some(name => !name.trim())) {
      alert('請完整填寫所有攜伴者的姓名！');
      return;
    }

    const groupSize = 1 + companionCount;
    const cleanCompanionNames = companionNames.map(n => n.trim());
    
    const availableTeams = teams.filter(t => 
      (t.capacity - t.members.length) >= groupSize &&
      t.companionLimit >= companionCount
    );

    if (availableTeams.length === 0) {
      alert(`目前沒有任何隊伍可容納 ${groupSize} 人，或是您的攜伴人數超過了所有剩餘隊伍的上限限制！`);
      return;
    }

    const randomTeamIndex = Math.floor(Math.random() * availableTeams.length);
    const selectedTeam = availableTeams[randomTeamIndex];
    const newMembers = [mainName.trim(), ...cleanCompanionNames];

    setTeams(teams.map(t => {
      if (t.id === selectedTeam.id) {
        return { ...t, members: [...t.members, ...newMembers] };
      }
      return t;
    }));

    setDrawResult({ teamName: selectedTeam.name, members: newMembers });
    setMainName('');
    setCompanionCount(0);
    setCompanionNames([]);
  };

  // --- 動態計算目前可用的最大攜伴人數 ---
  let maxAllowedCompanions = 0;
  teams.forEach(t => {
    // 隊伍剩餘空位 (必須先扣掉主要抽籤者自己 1 人)
    const availableSpaceForCompanions = t.capacity - t.members.length - 1;
    if (availableSpaceForCompanions >= 0) {
      // 該隊伍能允許的攜伴，是「設定的攜伴上限」與「剩餘空位」取最小值
      const teamMaxCompanions = Math.min(t.companionLimit, availableSpaceForCompanions);
      if (teamMaxCompanions > maxAllowedCompanions) {
        maxAllowedCompanions = teamMaxCompanions;
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-600 flex items-center justify-center gap-3">
            <Shuffle className="w-10 h-10" />
            動態分組抽籤系統
          </h1>
        </header>

        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setPhase('setup')}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${phase === 'setup' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            1. 隊伍設定
          </button>
          <button 
            onClick={() => {
              if (teams.length === 0) {
                alert('請先建立至少一個隊伍！');
                return;
              }
              setPhase('draw');
              setDrawResult(null);
            }}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${phase === 'draw' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            2. 開始抽籤
          </button>
        </div>

        {phase === 'setup' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="text-blue-500" /> 新增隊伍
            </h2>
            <div className="flex flex-wrap gap-4 mb-6 items-center">
              <input 
                type="text" 
                placeholder="隊伍名稱 (例如: A隊)" 
                className="flex-1 min-w-[200px] border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-1">
                <span className="text-gray-600 text-sm whitespace-nowrap">人數上限:</span>
                <input 
                  type="number" 
                  min="1"
                  className="w-16 bg-transparent outline-none text-center font-bold p-2"
                  value={newTeamCapacity}
                  onChange={(e) => setNewTeamCapacity(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-1">
                <span className="text-gray-600 text-sm whitespace-nowrap">攜伴上限:</span>
                <input 
                  type="number" 
                  min="0"
                  className="w-16 bg-transparent outline-none text-center font-bold p-2"
                  value={newTeamCompanionLimit}
                  onChange={(e) => setNewTeamCompanionLimit(e.target.value)}
                />
              </div>
              <button 
                onClick={handleAddTeam}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" /> 加入
              </button>
            </div>
          </div>
        )}

        {phase === 'draw' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 border-t-4 border-t-green-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Play className="text-green-500" /> 進行抽籤
            </h2>
            
            <div className="space-y-5 max-w-xl">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">主要抽籤者姓名</label>
                <input 
                  type="text" 
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                  value={mainName}
                  onChange={(e) => setMainName(e.target.value)}
                  placeholder="輸入姓名"
                />
              </div>

              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-bold text-gray-700">本次要攜伴幾人？</label>
                  <select 
                    className="border p-2 rounded-lg outline-none font-bold text-gray-700 bg-white min-w-[120px]"
                    value={companionCount}
                    onChange={handleCompanionCountChange}
                  >
                    <option value={0}>不攜伴 (0人)</option>
                    {/* 這裡改為根據 maxAllowedCompanions 動態渲染選項 */}
                    {Array.from({ length: maxAllowedCompanions }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} 人</option>
                    ))}
                  </select>
                </div>
                
                {maxAllowedCompanions === 0 && (
                  <p className="text-sm text-red-500 mt-2">※ 目前沒有任何隊伍有足夠的空間可以攜伴。</p>
                )}
                
                {companionCount > 0 && (
                  <div className="space-y-3 mt-4 border-t pt-4">
                    <label className="block text-sm font-bold text-gray-700">填寫攜伴者姓名：</label>
                    {companionNames.map((name, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 font-bold w-16">攜伴 {index + 1}</span>
                        <input 
                          type="text" 
                          className="flex-1 border p-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                          value={name}
                          onChange={(e) => handleCompanionNameChange(index, e.target.value)}
                          placeholder={`輸入第 ${index + 1} 位攜伴者姓名`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={handleDraw}
                className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-xl hover:bg-green-600 transition-all shadow-md hover:shadow-lg active:scale-95 flex justify-center items-center gap-2"
              >
                <Shuffle /> 抽出隊伍
              </button>
            </div>

            {drawResult && (
              <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  分配成功！
                </h3>
                <p className="text-lg text-gray-700">
                  <span className="font-bold text-blue-600">{drawResult.members.join('、')}</span> 
                  {' '}被分配到了{' '}
                  <span className="text-2xl font-black text-green-600 ml-1">{drawResult.teamName}</span>
                </p>
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">目前隊伍狀態</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => {
              const isFull = team.members.length >= team.capacity;
              return (
                <div key={team.id} className={`p-5 rounded-xl border-2 transition-all ${isFull ? 'bg-gray-100 border-gray-300' : 'bg-white border-blue-100 hover:border-blue-300 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{team.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">攜伴上限: {team.companionLimit} 人</p>
                    </div>
                    {phase === 'setup' && (
                      <button onClick={() => handleRemoveTeam(team.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="mb-3 flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${isFull ? 'bg-red-400' : 'bg-blue-500'}`} 
                        style={{ width: `${(team.members.length / team.capacity) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-bold ${isFull ? 'text-red-500' : 'text-gray-600'}`}>
                      {team.members.length}/{team.capacity}
                    </span>
                  </div>

                  <ul className="space-y-1 min-h-[60px]">
                    {team.members.map((member, idx) => (
                      <li key={idx} className="text-gray-700 bg-gray-50 px-2 py-1 rounded text-sm border border-gray-100">
                        {member}
                      </li>
                    ))}
                    {team.members.length === 0 && (
                      <li className="text-gray-400 text-sm italic">尚無成員</li>
                    )}
                  </ul>
                </div>
              )
            })}
            {teams.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
                尚未建立任何隊伍
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}