import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ImportData() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number; message: string } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        setResult({ success: 0, errors: 0, message: 'Plik jest pusty' });
        setImporting(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1);

      let successCount = 0;
      let errorCount = 0;

      for (const line of data) {
        try {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const leadData: any = {};

          headers.forEach((header, index) => {
            const value = values[index];
            if (!value || value === '') return;

            switch (header.toLowerCase()) {
              case 'nazwa':
              case 'name':
                leadData.name = value;
                break;
              case 'telefon':
              case 'phone':
                leadData.phone = value;
                break;
              case 'email':
              case 'e-mail':
                leadData.email = value;
                break;
              case 'kategoria':
              case 'category':
                leadData.category = value;
                break;
              case 'lokalizacja':
              case 'location':
              case 'miasto':
                leadData.location = value;
                break;
              case 'wlasciciel':
              case 'owner':
              case 'owner_email':
                leadData.owner_email = value;
                break;
              case 'osoba kontaktowa':
              case 'contact_person':
                leadData.contact_person = value;
                break;
              case 'notatki':
              case 'notes':
                leadData.notes = value;
                break;
            }
          });

          if (!leadData.name) {
            errorCount++;
            continue;
          }

          leadData.status = 'new';
          leadData.call_status = 'pending';

          const { error } = await supabase.from('leads').insert([leadData]);

          if (error) {
            console.error('Error inserting lead:', error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error('Error processing line:', err);
          errorCount++;
        }
      }

      setResult({
        success: successCount,
        errors: errorCount,
        message: `Zaimportowano ${successCount} leadów. Błędów: ${errorCount}`
      });
    } catch (error) {
      console.error('Error reading file:', error);
      setResult({ success: 0, errors: 0, message: 'Błąd podczas czytania pliku' });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `Nazwa,Telefon,Email,Kategoria,Lokalizacja,Osoba Kontaktowa,Notatki
Salon Fryzjerski "Dorota",+48 76 835 67 67,dorota@example.com,Salony Piękności,Pl. Głogów,Dorota Rolla,
Your Laser,+48 690 053 665,yourlaser@example.com,Salony Piękności,Pl. Głogów,,
Makijaż Permanentny Marta,+48 661 111 247,marta@example.com,Salony Piękności,Pl. Głogów,Marta Kazimierska,`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'szablon_leadow.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-2">
          Import danych
        </h1>
        <p className="text-slate-400">
          Importuj leady z pliku CSV
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Format pliku CSV</h3>
              <p className="text-sm text-slate-400">Wymagane kolumny i struktura</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <div>
              <p className="font-medium text-white mb-2">Wymagane kolumny:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><span className="text-white">Nazwa</span> - nazwa firmy (wymagane)</li>
                <li><span className="text-white">Telefon</span> - numer telefonu</li>
                <li><span className="text-white">Email</span> - adres e-mail</li>
                <li><span className="text-white">Kategoria</span> - typ działalności</li>
                <li><span className="text-white">Lokalizacja</span> - miasto/adres</li>
                <li><span className="text-white">Osoba Kontaktowa</span> - imię i nazwisko</li>
                <li><span className="text-white">Notatki</span> - dodatkowe informacje</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-white/10">
              <p className="text-slate-400 mb-3">
                Pobierz szablon pliku CSV z przykładowymi danymi:
              </p>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <Download className="w-4 h-4" />
                Pobierz szablon CSV
              </button>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-violet-500/20">
              <Upload className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Importuj plik</h3>
              <p className="text-sm text-slate-400">Wybierz plik CSV do importu</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-slate-400 mb-3" />
                <p className="mb-2 text-sm text-slate-300">
                  <span className="font-semibold">Kliknij aby wybrać plik</span> lub przeciągnij tutaj
                </p>
                <p className="text-xs text-slate-400">Tylko pliki CSV</p>
              </div>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={importing}
              />
            </label>

            {importing && (
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                <p className="text-blue-300">Importowanie danych...</p>
              </div>
            )}

            {result && (
              <div className={`flex items-start gap-3 p-4 rounded-xl ${
                result.errors === 0
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-yellow-500/10 border border-yellow-500/30'
              }`}>
                {result.errors === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={result.errors === 0 ? 'text-green-300' : 'text-yellow-300'}>
                    {result.message}
                  </p>
                  {result.success > 0 && (
                    <p className="text-sm text-slate-400 mt-1">
                      Odśwież stronę lub przejdź do zakładki "Wszystkie Leady" aby zobaczyć zaimportowane dane
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-slate-300">
            <p className="font-medium text-white">Wskazówki:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Plik musi być w formacie CSV (wartości rozdzielone przecinkami)</li>
              <li>Pierwsza linia powinna zawierać nazwy kolumn</li>
              <li>Kolumna "Nazwa" jest wymagana - bez niej lead nie zostanie zaimportowany</li>
              <li>Pozostałe kolumny są opcjonalne</li>
              <li>Kodowanie pliku: UTF-8</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
