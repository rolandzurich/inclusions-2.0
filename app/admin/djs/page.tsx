'use client';

import { useEffect, useState } from 'react';
import { DJ, DJPair, DJsData } from '@/types/dj';

export default function DJsEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<DJsData | null>(null);
  const [selectedDJ, setSelectedDJ] = useState<DJ | null>(null);
  const [selectedPair, setSelectedPair] = useState<DJPair | null>(null);
  const [editingType, setEditingType] = useState<'dj' | 'pair' | null>(null);

  useEffect(() => {
    fetchDJs();
  }, []);

  const fetchDJs = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      
      const response = await fetch('/api/admin/djs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const djsData = await response.json();
        setData(djsData);
      } else {
        alert('Fehler beim Laden der DJ-Daten');
      }
    } catch (error) {
      console.error('Error fetching DJs:', error);
      alert('Fehler beim Laden der DJ-Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data) return;

    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      
      const response = await fetch('/api/admin/djs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('DJ-Daten erfolgreich gespeichert!');
        setSelectedDJ(null);
        setSelectedPair(null);
        setEditingType(null);
      } else {
        alert('Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error saving DJs:', error);
      alert('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleDJEdit = (dj: DJ) => {
    setSelectedDJ(dj);
    setSelectedPair(null);
    setEditingType('dj');
  };

  const handlePairEdit = (pair: DJPair) => {
    setSelectedPair(pair);
    setSelectedDJ(null);
    setEditingType('pair');
  };

  const updateDJ = (updatedDJ: DJ) => {
    if (!data) return;
    setData({
      ...data,
      djs: data.djs.map(dj => dj.id === updatedDJ.id ? updatedDJ : dj),
    });
    setSelectedDJ(updatedDJ);
  };

  const updatePair = (updatedPair: DJPair) => {
    if (!data) return;
    setData({
      ...data,
      pairs: data.pairs.map(pair => pair.id === updatedPair.id ? updatedPair : pair),
    });
    setSelectedPair(updatedPair);
  };

  if (loading) {
    return <div className="text-center py-12">Lädt...</div>;
  }

  if (!data) {
    return <div className="text-center py-12 text-red-400">Fehler beim Laden der Daten</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">DJ-Texte bearbeiten</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-brand-pink text-black rounded hover:bg-brand-pink/90 disabled:opacity-50"
        >
          {saving ? 'Wird gespeichert...' : 'Alle Änderungen speichern'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DJs Liste */}
        <div className="lg:col-span-1 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Resident DJs ({data.djs.length})</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {data.djs.map((dj) => (
              <div
                key={dj.id}
                onClick={() => handleDJEdit(dj)}
                className={`p-4 rounded cursor-pointer border ${
                  selectedDJ?.id === dj.id
                    ? 'border-brand-pink bg-gray-700'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <p className="font-semibold">{dj.name}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {dj.text || 'Kein Text'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* DJ Pairs Liste */}
        <div className="lg:col-span-1 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">DJ Pairs ({data.pairs.length})</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {data.pairs.map((pair) => (
              <div
                key={pair.id}
                onClick={() => handlePairEdit(pair)}
                className={`p-4 rounded cursor-pointer border ${
                  selectedPair?.id === pair.id
                    ? 'border-brand-pink bg-gray-700'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <p className="font-semibold">{pair.name}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {pair.text || 'Kein Text'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-1 bg-gray-800 rounded-lg p-6">
          {editingType === 'dj' && selectedDJ ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">DJ bearbeiten: {selectedDJ.name}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedDJ.name}
                    onChange={(e) => updateDJ({ ...selectedDJ, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Text</label>
                  <textarea
                    value={selectedDJ.text || ''}
                    onChange={(e) => updateDJ({ ...selectedDJ, text: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-48"
                    placeholder="Beschreibung des DJs..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">SoundCloud URL</label>
                  <input
                    type="text"
                    value={selectedDJ.soundcloud || ''}
                    onChange={(e) => updateDJ({ ...selectedDJ, soundcloud: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    placeholder="https://soundcloud.com/..."
                  />
                </div>
              </div>
            </div>
          ) : editingType === 'pair' && selectedPair ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">DJ Pair bearbeiten: {selectedPair.name}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedPair.name}
                    onChange={(e) => updatePair({ ...selectedPair, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Text</label>
                  <textarea
                    value={selectedPair.text || ''}
                    onChange={(e) => updatePair({ ...selectedPair, text: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-48"
                    placeholder="Beschreibung des DJ Pairs..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Wähle einen DJ oder ein DJ Pair aus, um die Texte zu bearbeiten
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Hinweis:</strong> Änderungen werden erst nach Klick auf "Alle Änderungen speichern" gespeichert.
          Die Texte werden sofort auf der DJ-Seite angezeigt, nachdem sie gespeichert wurden.
        </p>
      </div>
    </div>
  );
}
