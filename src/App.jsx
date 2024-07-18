import { useState, useRef } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const AudioLabelingApp = () => {
  const [labels, setLabels] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentLabel, setCurrentLabel] = useState('');
  const [labeledData, setLabeledData] = useState([]);
  const audioRef = useRef(null);


  const handleLabelsChange = (e) => {
    setLabels(e.target.value.split('\n').filter(label => label.trim() !== ''));
  };

  const handleFolderSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file => file.type.startsWith('audio/'));
    setFiles(selectedFiles);
    setLabeledData(selectedFiles.map(file => ({ file, label: '' })));
  };


  const handleLabelSelect = (label) => {
    setCurrentLabel(label);
    const newLabeledData = [...labeledData];
    newLabeledData[currentFileIndex] = { ...newLabeledData[currentFileIndex], label };
    setLabeledData(newLabeledData);
  };

  const handleNext = () => {
    if (currentFileIndex < files.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
      setCurrentLabel(labeledData[currentFileIndex + 1]?.label || '');
    }
  };

  const handlePrevious = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
      setCurrentLabel(labeledData[currentFileIndex - 1]?.label || '');
    }
  };

  const generateCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "File Path,Label\n"
      + labeledData.map(item => `${item.file.webkitRelativePath},${item.label}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "labeled_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center gap-3 w-3/4">
      <h1 className="text-2xl font-bold mb-4">Audio Dataset Labeling</h1>

      {files.length === 0 && <div>

        <Label htmlFor="labels">Enter Labels (one per line)</Label>
        <Textarea
          id="labels"
          placeholder="Enter labels..."
          className="mt-1"
          rows={5}
          onChange={handleLabelsChange}
        />
      </div>
      }
      {labels.length > 0 && files.length === 0 &&
        <div className="mb-4">
          <Label htmlFor="folder">Select Folder</Label>
          <Input
            id="folder"
            type="file"
            webkitdirectory=""
            directory=""
            onChange={handleFolderSelect}
            className="mt-1"
          />
        </div>
      }

      {files.length > 0 && (
        <div>
          <div className="mb-4">
            <div className="mb-4">
              <audio
                ref={audioRef}
                src={URL.createObjectURL(files[currentFileIndex])}
                controls
              />
            </div>
            <div className="flex items-center justify-between">
              <Button onClick={handlePrevious} disabled={currentFileIndex === 0}>Previous</Button>
              <Button onClick={handleNext} disabled={currentFileIndex === files.length - 1}>Next</Button>
            </div>
            <p className="mt-2">Current File: {files[currentFileIndex].name}</p>
            <p className="mt-2">Current Label: {currentLabel || 'Not labeled'}</p>
          </div>


          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Select Label</h2>
            <div className="flex flex-wrap gap-2">
              {labels.map((label, index) => (
                <Button
                  key={index}
                  onClick={() => handleLabelSelect(label)}
                  variant={currentLabel === label ? 'default' : 'outline'}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={generateCSV} disabled={labeledData.length === 0}>
            <Save className="mr-2" />
            Generate CSV
          </Button>
        </div>
      )}
    </div>
  );
};

export default AudioLabelingApp;