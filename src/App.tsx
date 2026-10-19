/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Utensils,
  Camera,
  Refrigerator,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  BookOpen,
  Check,
  ChevronRight,
  Layers,
  Heart,
  AlertCircle,
  HelpCircle,
  Cpu,
  Minus
} from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  difficulty: string;
  appliancesUsed: string[];
  matchingIngredients: { name: string; amount: string }[];
  missingIngredients: string[];
  steps: string[];
  nutritionTips: string;
}

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: '1', name: '雞蛋', quantity: 4, unit: '顆', category: '肉蛋海鮮' },
  { id: '2', name: '高麗菜', quantity: 0.5, unit: '半顆', category: '蔬菜' },
  { id: '3', name: '板豆腐', quantity: 1, unit: '塊', category: '肉蛋海鮮' },
  { id: '4', name: '豬肉片', quantity: 200, unit: 'g', category: '肉蛋海鮮' },
  { id: '5', name: '洋蔥', quantity: 1, unit: '顆', category: '蔬菜' },
  { id: '6', name: '白米', quantity: 2, unit: '杯', category: '其他' },
];

const QUICK_COMMON_INGREDIENTS = [
  { name: '蒜頭', category: '調味料', unit: '瓣', quantity: 3 },
  { name: '青蔥', category: '蔬菜', unit: '把', quantity: 1 },
  { name: '醬油', category: '調味料', unit: '瓶', quantity: 1 },
  { name: '牛奶', category: '乳製品', unit: 'ml', quantity: 500 },
  { name: '起司片', category: '乳製品', unit: '片', quantity: 4 },
  { name: '雞胸肉', category: '肉蛋海鮮', unit: '片', quantity: 2 },
  { name: '番茄', category: '蔬菜', unit: '顆', quantity: 2 },
  { name: '馬鈴薯', category: '蔬菜', unit: '顆', quantity: 2 },
];

export default function App() {
  const [theme, setTheme] = useState<'warm' | 'eco' | 'dark'>('warm');
  const [activeTab, setActiveTab] = useState<'inventory' | 'recipes' | 'history'>('inventory');
  
  // Inventory state
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [newIngName, setNewIngName] = useState('');
  const [newIngQty, setNewIngQty] = useState(1);
  const [newIngUnit, setNewIngUnit] = useState('個');
  const [newIngCategory, setNewIngCategory] = useState('蔬菜');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Filters state
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['高蛋白增肌']);
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>(['電鍋', '氣炸鍋', '單口瓦斯爐']);
  const [timeLimit, setTimeLimit] = useState('15分鐘極速');

  // Recipe generation state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Dynamic substitution state
  const [substitutePrompt, setSubstitutePrompt] = useState('');
  const [isSubstituting, setIsSubstituting] = useState(false);

  // History state
  const [cookingHistory, setCookingHistory] = useState<{ id: string; title: string; date: string; usedIngredients: string[] }[]>([]);

  // Camera / File ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Theme styles definition
  const themes = {
    warm: {
      name: '溫馨日系日嚐風',
      bg: 'bg-[#FDFBF7]',
      cardBg: 'bg-white',
      border: 'border-[#EBE7DF]',
      textPrimary: 'text-[#2C221E]',
      textSecondary: 'text-[#6B5E55]',
      primaryBtn: 'bg-[#C87D55] hover:bg-[#B06A44] text-white',
      accentTag: 'bg-[#F5EBE1] text-[#9E5A35]',
      navBg: 'bg-[#FAF6EE]',
      tabActive: 'bg-[#C87D55] text-white shadow-sm',
      tabInactive: 'text-[#6B5E55] hover:bg-[#F0ECE1]',
    },
    eco: {
      name: '極簡清新料理實驗室',
      bg: 'bg-[#F4F7F5]',
      cardBg: 'bg-white',
      border: 'border-[#D8E2DC]',
      textPrimary: 'text-[#1B3022]',
      textSecondary: 'text-[#4A6B5D]',
      primaryBtn: 'bg-[#588157] hover:bg-[#4A6B5D] text-white',
      accentTag: 'bg-[#E3ECE7] text-[#3A5A40]',
      navBg: 'bg-[#EAF1EC]',
      tabActive: 'bg-[#588157] text-white shadow-sm',
      tabInactive: 'text-[#4A6B5D] hover:bg-[#D8E2DC]',
    },
    dark: {
      name: '深夜食堂專業主廚風',
      bg: 'bg-[#121212]',
      cardBg: 'bg-[#1E1E1E]',
      border: 'border-[#2C2C2C]',
      textPrimary: 'text-[#F5F5F5]',
      textSecondary: 'text-[#A0A0A0]',
      primaryBtn: 'bg-[#E76F51] hover:bg-[#D65F41] text-white',
      accentTag: 'bg-[#2A2321] text-[#E76F51]',
      navBg: 'bg-[#181818]',
      tabActive: 'bg-[#E76F51] text-white shadow-sm',
      tabInactive: 'text-[#A0A0A0] hover:bg-[#2A2A2A]',
    },
  };

  const currentTheme = themes[theme];

  // Add manual ingredient
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) return;
    const finalCategory = isCustomCategory ? customCategoryInput.trim() || '其他' : newIngCategory;
    const newItem: Ingredient = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      name: newIngName.trim(),
      quantity: Number(newIngQty) || 1,
      unit: newIngUnit.trim() || '個',
      category: finalCategory,
    };
    setIngredients([newItem, ...ingredients]);
    setNewIngName('');
    setNewIngQty(1);
  };

  // Quick add common ingredient
  const handleQuickAdd = (item: typeof QUICK_COMMON_INGREDIENTS[0]) => {
    // Check if already exists, increment qty or add new
    const existing = ingredients.find(i => i.name === item.name);
    if (existing) {
      setIngredients(ingredients.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i));
    } else {
      const newItem: Ingredient = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
      };
      setIngredients([newItem, ...ingredients]);
    }
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients(ingredients.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setIngredients(ingredients.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0.1, Number((item.quantity + delta).toFixed(1)));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // AI Photo Recognition
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result as string;
      setIsRecognizing(true);
      try {
        const res = await fetch('/api/recognize-fridge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
        });
        const data = await res.json();
        if (data.ingredients && Array.isArray(data.ingredients)) {
          const newItems: Ingredient[] = data.ingredients.map((item: any, idx: number) => ({
            id: `${Date.now()}-${idx}`,
            name: item.name || '未知食材',
            quantity: item.quantity || 1,
            unit: item.unit || '個',
            category: item.category || '其他',
          }));
          setIngredients(prev => [...newItems, ...prev]);
          setActiveTab('inventory');
        }
      } catch (err) {
        console.error('Failed to recognize fridge photo:', err);
        alert('照片辨識失敗，請重試或手動新增食材。');
      } finally {
        setIsRecognizing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate Recipes
  const handleGenerateRecipes = async () => {
    if (ingredients.length === 0) {
      alert('請先在冰箱中新增或拍照辨識至少一項食材！');
      return;
    }
    setIsGenerating(true);
    setActiveTab('recipes');
    try {
      const res = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          preferences: selectedPreferences,
          appliances: selectedAppliances,
          timeLimit,
        }),
      });
      const data = await res.json();
      if (data.recipes && Array.isArray(data.recipes)) {
        setRecipes(data.recipes);
      }
    } catch (err) {
      console.error('Failed to generate recipes:', err);
      alert('食譜生成失敗，請稍後再試。');
    } finally {
      setIsGenerating(false);
    }
  };

  // Dynamic Recipe Substitution
  const handleSubstitute = async () => {
    if (!selectedRecipe || !substitutePrompt.trim()) return;
    setIsSubstituting(true);
    try {
      const res = await fetch('/api/substitute-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRecipe: selectedRecipe,
          ingredients,
          instruction: substitutePrompt.trim(),
        }),
      });
      const data = await res.json();
      if (data.recipe) {
        setSelectedRecipe(data.recipe);
        setRecipes(recipes.map(r => r.id === selectedRecipe.id ? data.recipe : r));
        setSubstitutePrompt('');
      }
    } catch (err) {
      console.error('Failed to substitute recipe:', err);
      alert('換菜失敗，請重試。');
    } finally {
      setIsSubstituting(false);
    }
  };

  // Cook & Deduct Inventory
  const handleCookAndDeduct = (recipe: Recipe) => {
    const usedNames = recipe.matchingIngredients.map(m => m.name);
    const updatedIngredients = ingredients.map(item => {
      const isUsed = usedNames.some(name => item.name.includes(name) || name.includes(item.name));
      if (isUsed) {
        const newQty = Math.max(0, item.quantity - 1);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0);

    setIngredients(updatedIngredients);

    const historyItem = {
      id: Date.now().toString(),
      title: recipe.title,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      usedIngredients: usedNames,
    };
    setCookingHistory([historyItem, ...cookingHistory]);
    setSelectedRecipe(null);
    alert(`太棒了！「${recipe.title}」烹飪完成！已自動從冰箱庫存中扣除用掉的食材。`);
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.textPrimary} transition-colors duration-300 font-sans`}>
      {/* Top Header */}
      <header className={`${currentTheme.navBg} border-b ${currentTheme.border} sticky top-0 z-30 shadow-xs`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${currentTheme.primaryBtn} shadow-sm flex items-center justify-center`}>
              <Refrigerator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                智能冰箱靈感大廚
                <span className={`text-xs px-2 py-0.5 rounded-full ${currentTheme.accentTag}`}>AI 智慧烹飪</span>
              </h1>
              <p className={`text-xs ${currentTheme.textSecondary}`}>拍照清單・自定義新增・一鍵換菜・庫存自動扣除</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Theme switcher */}
            <div className={`flex items-center p-1 rounded-xl border ${currentTheme.border} ${currentTheme.cardBg}`}>
              {(['warm', 'eco', 'dark'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    theme === t ? currentTheme.primaryBtn : `${currentTheme.textSecondary} hover:opacity-80`
                  }`}
                >
                  {themes[t].name.slice(0, 6)}
                </button>
              ))}
            </div>

            {/* Camera upload button */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isRecognizing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all ${currentTheme.primaryBtn} disabled:opacity-50`}
            >
              {isRecognizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI 辨識中...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>拍照/上傳冰箱</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-2 pb-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'inventory' ? currentTheme.tabActive : currentTheme.tabInactive
            }`}
          >
            <Refrigerator className="w-4 h-4" />
            <span>冰箱現有庫存 ({ingredients.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'recipes' ? currentTheme.tabActive : currentTheme.tabInactive
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>智慧食譜推薦 ({recipes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'history' ? currentTheme.tabActive : currentTheme.tabInactive
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>烹飪紀錄 ({cookingHistory.length})</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* TAB 1: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Banner card & Quick Add */}
            <div className={`p-6 rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs relative overflow-hidden flex flex-col lg:flex-row items-start justify-between gap-6`}>
              <div className="space-y-3 max-w-lg">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${currentTheme.accentTag}`}>
                  支援多模態辨識與完全自定義新增
                </span>
                <h2 className="text-2xl font-bold">管理您的冰箱庫存與常用食材</h2>
                <p className={`text-sm ${currentTheme.textSecondary}`}>
                  您可以透過拍照 AI 自動辨識、點擊下方常用食材快速加入，或使用自定義表單隨時新增任何食材與分類！
                </p>

                {/* Quick Add Common Ingredients */}
                <div className="pt-2">
                  <p className="text-xs font-semibold mb-2 opacity-80">🔥 常用食材一鍵快速加入：</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_COMMON_INGREDIENTS.map(item => (
                      <button
                        key={item.name}
                        onClick={() => handleQuickAdd(item)}
                        className={`px-3 py-1 rounded-xl text-xs font-medium border ${currentTheme.border} ${currentTheme.navBg} hover:opacity-80 transition-all flex items-center gap-1`}
                      >
                        <Plus className="w-3 h-3 text-[#C87D55]" /> {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={handleGenerateRecipes}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm ${currentTheme.primaryBtn}`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>根據現有食材生成食譜</span>
                  </button>
                </div>
              </div>

              {/* Custom Add Form */}
              <div className={`p-5 rounded-2xl border ${currentTheme.border} ${currentTheme.navBg} w-full lg:w-80 shrink-0`}>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> 自定義新增食材選項
                </h3>
                <form onSubmit={handleAddIngredient} className="space-y-3">
                  <input
                    type="text"
                    placeholder="食材名稱（例如：松露醬）"
                    value={newIngName}
                    onChange={e => setNewIngName(e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-xl border ${currentTheme.border} ${currentTheme.cardBg} outline-none`}
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="數量"
                      value={newIngQty}
                      onChange={e => setNewIngQty(Number(e.target.value))}
                      className={`w-1/2 px-3 py-2 text-sm rounded-xl border ${currentTheme.border} ${currentTheme.cardBg} outline-none`}
                    />
                    <input
                      type="text"
                      placeholder="單位 (顆/g/包)"
                      value={newIngUnit}
                      onChange={e => setNewIngUnit(e.target.value)}
                      className={`w-1/2 px-3 py-2 text-sm rounded-xl border ${currentTheme.border} ${currentTheme.cardBg} outline-none`}
                    />
                  </div>

                  {/* Category Selection / Custom Category */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="opacity-80 font-medium">分類</span>
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(!isCustomCategory)}
                        className="text-[#C87D55] font-semibold hover:underline"
                      >
                        {isCustomCategory ? '選擇預設分類' : '+ 自定義分類'}
                      </button>
                    </div>
                    {isCustomCategory ? (
                      <input
                        type="text"
                        placeholder="輸入自定義分類名稱（例：即食冷凍庫）"
                        value={customCategoryInput}
                        onChange={e => setCustomCategoryInput(e.target.value)}
                        className={`w-full px-3 py-2 text-sm rounded-xl border ${currentTheme.border} ${currentTheme.cardBg} outline-none`}
                      />
                    ) : (
                      <select
                        value={newIngCategory}
                        onChange={e => setNewIngCategory(e.target.value)}
                        className={`w-full px-3 py-2 text-sm rounded-xl border ${currentTheme.border} ${currentTheme.cardBg} outline-none`}
                      >
                        <option value="蔬菜">蔬菜類</option>
                        <option value="肉蛋海鮮">肉蛋海鮮類</option>
                        <option value="乳製品">乳製品</option>
                        <option value="調味料">調味料</option>
                        <option value="水果">水果類</option>
                        <option value="其他">其他主食/乾貨</option>
                      </select>
                    )}
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-sm ${currentTheme.primaryBtn}`}
                  >
                    確認新增至冰箱
                  </button>
                </form>
              </div>
            </div>

            {/* Inventory Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Refrigerator className="w-5 h-5" /> 目前冰箱食材 ({ingredients.length} 項)
                </h3>
                {ingredients.length > 0 && (
                  <button
                    onClick={handleGenerateRecipes}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${currentTheme.primaryBtn}`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>前往生成食譜</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {ingredients.length === 0 ? (
                <div className={`text-center py-16 rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} space-y-3`}>
                  <Refrigerator className={`w-12 h-12 mx-auto opacity-40`} />
                  <p className="font-medium">您的冰箱目前空空如也！</p>
                  <p className={`text-xs ${currentTheme.textSecondary}`}>請點擊上方常用食材、拍照上傳或使用自定義表單新增。</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {ingredients.map(item => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs flex flex-col justify-between group hover:shadow-md transition-all space-y-3`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${currentTheme.accentTag}`}>
                            {item.category}
                          </span>
                          <h4 className="font-bold text-base mt-1.5">{item.name}</h4>
                        </div>
                        <button
                          onClick={() => handleDeleteIngredient(item.id)}
                          className={`p-1.5 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all`}
                          title="刪除食材"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-dashed ${currentTheme.border}">
                        <span className={`text-xs ${currentTheme.textSecondary}`}>
                          數量：<strong className="text-current font-bold text-sm">{item.quantity}</strong> {item.unit}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className={`w-7 h-7 rounded-lg border ${currentTheme.border} flex items-center justify-center hover:opacity-80 text-xs font-bold`}
                            title="減少數量"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className={`w-7 h-7 rounded-lg border ${currentTheme.border} flex items-center justify-center hover:opacity-80 text-xs font-bold`}
                            title="增加數量"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: RECIPES & FILTERS */}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            {/* Filters panel */}
            <div className={`p-6 rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs space-y-5`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" /> 飲食偏好與設備限制設定
                </h3>
                <button
                  onClick={handleGenerateRecipes}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm ${currentTheme.primaryBtn} disabled:opacity-50`}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI 正在研發食譜...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>重新生成客製食譜</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                {/* Preferences */}
                <div className="space-y-2">
                  <label className="font-semibold text-xs uppercase tracking-wider opacity-80">飲食風格偏好</label>
                  <div className="flex flex-wrap gap-2">
                    {['高蛋白增肌', '低醣生酮', '全素/蔬食', '均衡家常', '地中海飲食'].map(pref => (
                      <button
                        key={pref}
                        onClick={() => {
                          if (selectedPreferences.includes(pref)) {
                            setSelectedPreferences(selectedPreferences.filter(p => p !== pref));
                          } else {
                            setSelectedPreferences([...selectedPreferences, pref]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          selectedPreferences.includes(pref)
                            ? currentTheme.primaryBtn
                            : `${currentTheme.border} hover:opacity-80`
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Appliances */}
                <div className="space-y-2">
                  <label className="font-semibold text-xs uppercase tracking-wider opacity-80">可用烹飪設備</label>
                  <div className="flex flex-wrap gap-2">
                    {['電鍋', '氣炸鍋', '微波爐', '單口瓦斯爐', '烤箱'].map(app => (
                      <button
                        key={app}
                        onClick={() => {
                          if (selectedAppliances.includes(app)) {
                            setSelectedAppliances(selectedAppliances.filter(a => a !== app));
                          } else {
                            setSelectedAppliances([...selectedAppliances, app]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          selectedAppliances.includes(app)
                            ? currentTheme.primaryBtn
                            : `${currentTheme.border} hover:opacity-80`
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time limit */}
                <div className="space-y-2">
                  <label className="font-semibold text-xs uppercase tracking-wider opacity-80">時間限制</label>
                  <div className="flex flex-wrap gap-2">
                    {['15分鐘極速', '30分鐘內', '不限時間'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTimeLimit(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          timeLimit === t
                            ? currentTheme.primaryBtn
                            : `${currentTheme.border} hover:opacity-80`
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recipes Results */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> 推薦食譜列表 ({recipes.length})
                </h3>
              </div>

              {isGenerating ? (
                <div className={`text-center py-20 rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} space-y-4`}>
                  <RefreshCw className="w-10 h-10 animate-spin mx-auto text-[#C87D55]" />
                  <p className="font-bold text-lg">AI 主廚正在分析冰箱食材與飲食限制...</p>
                  <p className={`text-xs ${currentTheme.textSecondary}`}>結合現有食材與您的設備，打造 3 道客製化美味料理中。</p>
                </div>
              ) : recipes.length === 0 ? (
                <div className={`text-center py-16 rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} space-y-3`}>
                  <Utensils className="w-12 h-12 mx-auto opacity-40" />
                  <p className="font-medium">尚未生成食譜！</p>
                  <p className={`text-xs ${currentTheme.textSecondary}`}>請點擊上方按鈕，根據現有冰箱食材一鍵生成食譜。</p>
                  <button
                    onClick={handleGenerateRecipes}
                    className={`mt-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm ${currentTheme.primaryBtn}`}
                  >
                    立即生成 3 道客製食譜
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recipes.map(recipe => (
                    <div
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      className={`p-5 rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${currentTheme.accentTag}`}>
                            {recipe.difficulty}
                          </span>
                          <span className={`text-xs flex items-center gap-1 ${currentTheme.textSecondary}`}>
                            <Clock className="w-3.5 h-3.5" /> {recipe.prepTimeMinutes} 分鐘
                          </span>
                        </div>

                        <h4 className="font-bold text-xl group-hover:text-[#C87D55] transition-colors">{recipe.title}</h4>
                        <p className={`text-xs ${currentTheme.textSecondary} line-clamp-2`}>{recipe.description}</p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {recipe.appliancesUsed.map((app, i) => (
                            <span key={i} className={`text-[10px] px-2 py-0.5 rounded-md border ${currentTheme.border}`}>
                              {app}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-dashed ${currentTheme.border} flex items-center justify-between">
                        <span className="text-xs font-semibold">包含 {recipe.matchingIngredients.length} 項現有食材</span>
                        <span className={`text-xs font-bold flex items-center gap-1 ${currentTheme.textPrimary}`}>
                          查看詳情與烹飪 <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: COOKING HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> 烹飪歷史與庫存扣除紀錄
            </h3>

            {cookingHistory.length === 0 ? (
              <div className={`text-center py-16 rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} space-y-3`}>
                <BookOpen className="w-12 h-12 mx-auto opacity-40" />
                <p className="font-medium">尚無烹飪紀錄</p>
                <p className={`text-xs ${currentTheme.textSecondary}`}>當您完成料理並點擊「烹飪完成並扣除庫存」時，紀錄將在此顯示。</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cookingHistory.map(item => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs flex items-center justify-between`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-bold text-base">{item.title}</h4>
                      </div>
                      <p className={`text-xs ${currentTheme.textSecondary}`}>
                        完成時間：{item.date} ｜ 已自動扣除食材：{item.usedIngredients.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* RECIPE DETAIL MODAL WITH DYNAMIC SUBSTITUTION & COOKING */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border ${currentTheme.border} ${currentTheme.cardBg} p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200`}>
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${currentTheme.accentTag}`}>
                  {selectedRecipe.difficulty} ｜ 需 {selectedRecipe.prepTimeMinutes} 分鐘
                </span>
                <h3 className="text-2xl font-bold mt-2">{selectedRecipe.title}</h3>
                <p className={`text-sm ${currentTheme.textSecondary} mt-1`}>{selectedRecipe.description}</p>
              </div>
              <button
                onClick={() => setSelectedRecipe(null)}
                className={`p-2 rounded-xl border ${currentTheme.border} hover:opacity-80`}
              >
                ✕
              </button>
            </div>

            {/* Appliances & Nutrition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className={`p-3 rounded-2xl border ${currentTheme.border} ${currentTheme.navBg}`}>
                <span className="font-bold block mb-1">使用設備：</span>
                <div className="flex flex-wrap gap-1">
                  {selectedRecipe.appliancesUsed.map((app, i) => (
                    <span key={i} className={`px-2 py-0.5 rounded-md ${currentTheme.accentTag} font-medium`}>
                      {app}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`p-3 rounded-2xl border ${currentTheme.border} ${currentTheme.navBg}`}>
                <span className="font-bold block mb-1">營養與健康亮點：</span>
                <p className={currentTheme.textSecondary}>{selectedRecipe.nutritionTips}</p>
              </div>
            </div>

            {/* Ingredients checklist */}
            <div className="space-y-3">
              <h4 className="font-bold text-base flex items-center gap-2">
                <Utensils className="w-4 h-4" /> 食材清單
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {selectedRecipe.matchingIngredients.map((ing, i) => (
                  <div key={i} className={`p-2.5 rounded-xl border ${currentTheme.border} flex items-center justify-between`}>
                    <span className="font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" /> {ing.name}
                    </span>
                    <span className={currentTheme.textSecondary}>{ing.amount}</span>
                  </div>
                ))}
              </div>
              {selectedRecipe.missingIngredients.length > 0 && (
                <p className={`text-xs ${currentTheme.textSecondary} pt-1`}>
                  💡 建議可搭配（選填）：{selectedRecipe.missingIngredients.join(', ')}
                </p>
              )}
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <h4 className="font-bold text-base flex items-center gap-2">
                <Flame className="w-4 h-4" /> 烹飪步驟
              </h4>
              <ol className="space-y-2.5 text-sm">
                {selectedRecipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className={`w-6 h-6 rounded-full ${currentTheme.primaryBtn} flex items-center justify-center shrink-0 text-xs font-bold`}>
                      {i + 1}
                    </span>
                    <p className="pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Dynamic Substitution Chat */}
            <div className={`p-4 rounded-2xl border ${currentTheme.border} ${currentTheme.navBg} space-y-3`}>
              <h4 className="font-bold text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> 一鍵食材減法與動態換菜（對話微調）
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="例如：這道我不喜歡，換一道不用開火的 / 我想把豬肉換成豆腐"
                  value={substitutePrompt}
                  onChange={e => setSubstitutePrompt(e.target.value)}
                  className={`flex-1 px-3 py-2 text-sm rounded-xl border ${currentTheme.border} ${currentTheme.cardBg} outline-none`}
                />
                <button
                  onClick={handleSubstitute}
                  disabled={isSubstituting || !substitutePrompt.trim()}
                  className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${currentTheme.primaryBtn} disabled:opacity-50`}
                >
                  {isSubstituting ? '換菜中...' : '送出微調'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t ${currentTheme.border} flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedRecipe(null)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium border ${currentTheme.border}`}
              >
                關閉
              </button>
              <button
                onClick={() => handleCookAndDeduct(selectedRecipe)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md ${currentTheme.primaryBtn}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>烹飪完成並扣除冰箱庫存</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
