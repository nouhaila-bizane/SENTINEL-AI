import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card, Button, Input, Textarea, Badge } from '../../components/ui';
import { Upload, Loader2 } from 'lucide-react';

export default function NewAnalysis() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceCode, setSourceCode] = useState('');
  const [fileName, setFileName] = useState('');
  const [analysisType, setAnalysisType] = useState<'full' | 'security' | 'specification' | 'verification'>('full');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      setError('File too large (max 500KB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSourceCode(String(reader.result || ''));
      setFileName(file.name);
      setError('');
    };
    reader.readAsText(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!sourceCode.trim()) return setError('Source code is required');
    setLoading(true);
    try {
      const { data } = await api.post('/analyses', { projectName, description, sourceCode, fileName, analysisType });
      navigate(`/app/analyses/${data.analysis._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Analysis</h1>
        <p className="text-sentinel-muted mt-1">Submit specifications and source code for verification.</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <Card className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Project name *</label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} required placeholder="My Project" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Analysis type</label>
              <select value={analysisType} onChange={(e) => setAnalysisType(e.target.value as any)} className="auth-input">
                <option value="full">Full (Spec + Security + Verification)</option>
                <option value="security">Security only</option>
                <option value="specification">Specification only</option>
                <option value="verification">Verification only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Specification / description</label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the intended behavior, requirements, constraints..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Source code *</label>
            <div className="border-2 border-dashed border-sentinel-border rounded-lg p-6 text-center hover:border-sentinel-cyan/50 transition cursor-pointer relative">
              <input type="file" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" accept=".js,.ts,.jsx,.tsx,.py,.go,.java,.json,.txt,.md,.c,.cpp,.h,.rb,.php" />
              <Upload className="mx-auto text-sentinel-muted mb-2" size={28} />
              <p className="text-sm text-sentinel-muted">
                {fileName ? <><span className="text-sentinel-cyan">{fileName}</span> loaded</> : 'Drop a file or click to upload (max 500KB)'}
              </p>
            </div>
            <Textarea
              rows={12}
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              className="mt-3 font-mono text-xs"
              placeholder="// Or paste source code directly here..."
            />
          </div>

          {error && <div className="p-3 rounded-lg bg-sentinel-danger/10 border border-sentinel-danger/30 text-sentinel-danger text-sm">{error}</div>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/app')}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="animate-spin" size={16} /> Analyzing...</> : 'Start Analysis'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}