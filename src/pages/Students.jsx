import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Plus, Upload, Search, Printer, X, Loader2, AlertCircle, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

export const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [importData, setImportData] = useState(null);
  const queryClient = useQueryClient();

  // Fetch students
  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Filter students
  const filteredStudents = students?.filter((student) =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.parent_phone.includes(searchTerm)
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteStudent = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 no-print">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Students</h1>
          <p className="text-gray-600 text-lg">Ardayda - Manage Student Information</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-3 px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Upload className="w-6 h-6" />
            <span className="font-semibold">Import CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-6 h-6" />
            <span className="font-semibold">Add Student</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-3 px-6 py-3 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Printer className="w-6 h-6" />
            <span className="font-semibold">Print</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative no-print">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
        <input
          type="text"
          placeholder="Search students / Raadi ardey..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
        />
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden print-area border border-gray-100">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-16 text-center">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading students...</p>
            </div>
          ) : filteredStudents && filteredStudents.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Magac Ardeyga<br/><span className="text-xs normal-case font-normal text-gray-500">(Student Name)</span>
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Waalidka<br/><span className="text-xs normal-case font-normal text-gray-500">(Parent Name)</span>
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    N.Waalidka<br/><span className="text-xs normal-case font-normal text-gray-500">(Parent Phone)</span>
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Lacagta Bil Kasta<br/><span className="text-xs normal-case font-normal text-gray-500">(Monthly Fee)</span>
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Xaalad<br/><span className="text-xs normal-case font-normal text-gray-500">(Status)</span>
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider no-print">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-8 py-6 text-base font-semibold text-gray-900">
                      {student.student_name}
                    </td>
                    <td className="px-8 py-6 text-base text-gray-700">
                      {student.parent_name}
                    </td>
                    <td className="px-8 py-6 text-base text-gray-700">
                      {student.parent_phone}
                    </td>
                    <td className="px-8 py-6 text-lg font-bold text-green-600">
                      ${parseFloat(student.monthly_fee).toFixed(2)}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
                        student.status === 'active' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 no-print">
                      <button
                        onClick={() => handleDeleteStudent(student)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105"
                        title="Delete Student"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No students found</p>
              <p className="text-base text-gray-500">Ma jiraan arday lagu diiwaan geliyay</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(['students']);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <ImportCSVModal
          onClose={() => {
            setShowImportModal(false);
            setImportData(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries(['students']);
            setShowImportModal(false);
            setImportData(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <DeleteStudentModal
          student={studentToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setStudentToDelete(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries(['students']);
            setShowDeleteModal(false);
            setStudentToDelete(null);
          }}
        />
      )}
    </div>
  );
};

// Add Student Modal Component
const AddStudentModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    student_name: '',
    parent_name: '',
    parent_phone: '',
    monthly_fee: '',
    status: 'active',
  });

  const addMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('students')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Student added successfully!');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add student');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Student</h2>
            <p className="text-gray-600 mt-1">Ku Dar Ardey Cusub</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Magac Ardeyga (Student Name) *
              </label>
              <input
                type="text"
                required
                value={formData.student_name}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                className="w-full px-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter student name"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Waalidka (Parent Name) *
              </label>
              <input
                type="text"
                required
                value={formData.parent_name}
                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                className="w-full px-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter parent name"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">
                N.Waalidka (Parent Phone) *
              </label>
              <input
                type="tel"
                required
                value={formData.parent_phone}
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                className="w-full px-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Lacagta Bil Kasta (Monthly Fee) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.monthly_fee}
                onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                className="w-full px-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter monthly fee"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Xaalad (Status)
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 text-lg font-semibold border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="flex-1 px-6 py-4 text-lg font-semibold bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {addMutation.isPending ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Import CSV Modal Component
const ImportCSVModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);

  // Download CSV Template
  const handleDownloadTemplate = () => {
    const csvContent = [
      'Magac ardeyga,Waalidka,N.Waalidka,Lacagta,Xaalad',
      'Ahmed Hassan Ali,Fatima Mohamed,+252612345678,50.00,active',
      'Mariam Abdullahi,Hassan Ibrahim,+252613456789,75.00,active',
      'Omar Abdi Mohamed,Amina Hassan,+252614567890,100.00,active',
      'Hodan Yusuf,Yasmin Ahmed,+252615678901,60.00,active',
      'Abdirahman Hassan,Halima Ali,+252616789012,45.00,active',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'students_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      Papa.parse(selectedFile, {
        header: true,
        complete: (results) => {
          // Map Somali headers to database columns
          const mapped = results.data.map((row) => ({
            student_name: row['Magac ardeyga'] || row['student_name'] || '',
            parent_name: row['Waalidka'] || row['parent_name'] || '',
            parent_phone: row['N.Waalidka'] || row['parent_phone'] || '',
            monthly_fee: parseFloat(row['Lacagta'] || row['monthly_fee'] || 0),
            status: row['Xaalad'] || row['status'] || 'active',
          })).filter(row => row.student_name && row.parent_name);

          setPreview(mapped);
        },
      });
    }
  };

  const handleImport = async () => {
    if (!preview || preview.length === 0) {
      toast.error('No valid data to import');
      return;
    }

    setImporting(true);
    try {
      const { error } = await supabase
        .from('students')
        .insert(preview);

      if (error) throw error;

      toast.success(`Successfully imported ${preview.length} students!`);
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to import students');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Import Students from CSV</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">CSV Format Instructions:</p>
            <p className="text-sm text-blue-700 mb-3">
              Your CSV should include these headers (Somali or English):<br/>
              <code className="bg-blue-100 px-2 py-1 rounded mt-2 inline-block">
                Magac ardeyga, Waalidka, N.Waalidka, Lacagta, Xaalad
              </code>
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {preview && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Preview ({preview.length} students found)
              </p>
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Student Name</th>
                      <th className="px-3 py-2 text-left">Parent Name</th>
                      <th className="px-3 py-2 text-left">Phone</th>
                      <th className="px-3 py-2 text-left">Monthly Fee</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {preview.slice(0, 10).map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">{row.student_name}</td>
                        <td className="px-3 py-2">{row.parent_name}</td>
                        <td className="px-3 py-2">{row.parent_phone}</td>
                        <td className="px-3 py-2">${row.monthly_fee.toFixed(2)}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            row.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!preview || importing}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Students'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Student Modal Component
const DeleteStudentModal = ({ student, onClose, onSuccess }) => {
  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Delete student - this will cascade delete all invoices and payments
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Student "${student.student_name}" deleted successfully!`);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete student');
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-red-600">Delete Student</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">
                Are you sure you want to delete this student?
              </p>
              <p className="text-xs text-red-700 mt-1">
                This action cannot be undone and will permanently delete all related data.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-2">Student Details:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Name:</span> {student.student_name}</p>
              <p><span className="font-medium">Parent:</span> {student.parent_name}</p>
              <p><span className="font-medium">Phone:</span> {student.parent_phone}</p>
              <p><span className="font-medium">Monthly Fee:</span> ${parseFloat(student.monthly_fee).toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Warning:</span> This will also delete:
            </p>
            <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc">
              <li>All invoices for this student</li>
              <li>All payment records for those invoices</li>
              <li>All financial history</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Student'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

