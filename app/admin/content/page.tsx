'use client';

import { useEffect, useState } from 'react';

interface ContentBlock {
  id: string;
  key: string;
  title: string;
  body_markdown?: string;
  image_url?: string;
  published: boolean;
  updated_at: string;
  created_at?: string;
}

export default function ContentPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ContentBlock>>({});

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      
      const response = await fetch('/api/admin/content', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBlocks(data);
      }
    } catch (error) {
      console.error('Error fetching content blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.key || !formData.title) {
      alert('Key und Title sind erforderlich');
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const saved = await response.json();
        setBlocks(blocks.map(b => b.id === saved.id ? saved : b));
        setSelectedBlock(saved);
        setEditing(false);
        alert('Content-Block gespeichert!');
      } else {
        alert('Fehler beim Speichern');
      }
    } catch (error) {
      console.error('Error saving content block:', error);
      alert('Fehler beim Speichern');
    }
  };

  const handleEdit = (block: ContentBlock) => {
    setSelectedBlock(block);
    setFormData(block);
    setEditing(true);
  };

  const handleNew = () => {
    setSelectedBlock(null);
    setFormData({ published: true });
    setEditing(true);
  };

  if (loading) {
    return <div className="text-center py-12">Lädt...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <button
          onClick={handleNew}
          className="px-4 py-2 bg-brand-pink text-black rounded hover:bg-brand-pink/90"
        >
          Neuer Block
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Content-Blocks ({blocks.length})</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {blocks.map((block) => (
              <div
                key={block.id}
                onClick={() => {
                  setSelectedBlock(block);
                  setEditing(false);
                }}
                className={`p-4 rounded cursor-pointer border ${
                  selectedBlock?.id === block.id
                    ? 'border-brand-pink bg-gray-700'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{block.title}</p>
                    <p className="text-sm text-gray-400">{block.key}</p>
                    <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                      block.published
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {block.published ? 'Veröffentlicht' : 'Entwurf'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(block.updated_at).toLocaleDateString('de-CH')}
                  </span>
                </div>
              </div>
            ))}
            {blocks.length === 0 && (
              <p className="text-gray-400 text-center py-8">Keine Content-Blocks vorhanden</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          {editing ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {selectedBlock ? 'Block bearbeiten' : 'Neuer Block'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Key (eindeutig)</label>
                  <input
                    type="text"
                    value={formData.key || ''}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    disabled={!!selectedBlock}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Body (Markdown)</label>
                  <textarea
                    value={formData.body_markdown || ''}
                    onChange={(e) => setFormData({ ...formData, body_markdown: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-32"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.image_url || ''}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.published !== false}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-400">Veröffentlicht</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-brand-pink text-black rounded hover:bg-brand-pink/90"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({});
                    }}
                    className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          ) : selectedBlock ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Details</h2>
                <button
                  onClick={() => handleEdit(selectedBlock)}
                  className="px-3 py-1 bg-brand-pink text-black rounded text-sm hover:bg-brand-pink/90"
                >
                  Bearbeiten
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Key</p>
                  <p className="font-semibold">{selectedBlock.key}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Title</p>
                  <p className="font-semibold">{selectedBlock.title}</p>
                </div>
                {selectedBlock.body_markdown && (
                  <div>
                    <p className="text-sm text-gray-400">Body</p>
                    <p className="whitespace-pre-wrap">{selectedBlock.body_markdown}</p>
                  </div>
                )}
                {selectedBlock.image_url && (
                  <div>
                    <p className="text-sm text-gray-400">Image URL</p>
                    <p className="break-all">{selectedBlock.image_url}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <span className={`px-2 py-1 rounded text-sm ${
                    selectedBlock.published
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedBlock.published ? 'Veröffentlicht' : 'Entwurf'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Aktualisiert am</p>
                  <p>{new Date(selectedBlock.updated_at).toLocaleString('de-CH')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Wähle einen Block aus oder erstelle einen neuen
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


