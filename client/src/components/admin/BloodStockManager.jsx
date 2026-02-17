import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import bloodBankService from '../../services/bloodBankService';
import adminService from '../../services/adminService';

const BloodStockManager = () => {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updateData, setUpdateData] = useState({ bloodType: 'A+', quantity: 1, action: 'add', donorId: '' });
    const [selectedBloodType, setSelectedBloodType] = useState(null);
    const [units, setUnits] = useState([]);
    const [loadingUnits, setLoadingUnits] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [allDonors, setAllDonors] = useState([]);

    const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'donors'
    const [notificationMsg, setNotificationMsg] = useState('');

    useEffect(() => {
        fetchStock();
        fetchDonorsList();
    }, []);

    const fetchStock = async () => {
        try {
            const data = await bloodBankService.getStock();
            setStock(data);
        } catch (error) {
            toast.error('Failed to fetch stock levels');
        } finally {
            setLoading(false);
        }
    };

    const fetchDonorsList = async () => {
        try {
            const users = await adminService.getAllUsers();
            // Filter only donors
            const donorList = users.filter(user => user.role === 'donor');
            setAllDonors(donorList);
        } catch (error) {
            console.error('Failed to fetch donors list');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (updateData.action === 'add') {
            if (!updateData.isManual && !updateData.donorId) {
                toast.error('Please select a donor to add stock');
                return;
            }
            if (updateData.isManual && (!updateData.manualDonorName || !updateData.manualDonorPhone)) {
                toast.error('Please provide Donor Name and Phone for manual entry');
                return;
            }
        }

        try {
            await bloodBankService.updateStock(updateData);
            toast.success('Stock updated successfully');
            setUpdateData({ ...updateData, quantity: 1, donorId: '' });
            fetchStock();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update stock');
        }
    };

    const handleBloodTypeClick = async (bloodType) => {
        setSelectedBloodType(bloodType);
        setActiveTab('stock'); // Default to stock view
        setShowModal(true);
        setLoadingUnits(true);
        try {
            const data = await bloodBankService.getDonorsByBloodType(bloodType);
            setUnits(data);
        } catch (error) {
            toast.error('Failed to fetch units');
        } finally {
            setLoadingUnits(false);
        }
    };

    const handleNotify = async (donor) => {
        const message = prompt(`Send notification to ${donor.name}? Enter message:`, `Urgent need for ${donor.bloodType} blood. Please donate!`);
        if (!message) return;

        try {
            const response = await adminService.notifyDonor({
                donorId: donor._id,
                bloodType: donor.bloodType,
                message
            });
            toast.success(
                <div>
                    Notification sent to {donor.name}!
                    {response.previewUrl && (
                        <a href={response.previewUrl} target="_blank" rel="noopener noreferrer" className="block mt-2 underline text-yellow-200 font-bold">
                            Open Fake Email Preview
                        </a>
                    )}
                </div>,
                { duration: 6000 }
            );
        } catch (error) {
            toast.error('Failed to send notification');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedBloodType(null);
        setUnits([]);
        setActiveTab('stock');
    };

    // Filter donors for the dropdown based on selected blood type in form
    // Note: We allow selecting ANY donor, but showing only matching blood type is better for UX.
    // However, sometimes detailed blood type might differ or be updated, but generally stick to matching.
    const availableDonorsForType = allDonors.filter(d => d.bloodType === updateData.bloodType);

    // Filter donors for the "All Donors" tab in modal
    const potentialDonorsForModal = allDonors.filter(d => d.bloodType === selectedBloodType);

    if (loading) return <div>Loading stock...</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6 relative">
            <h2 className="text-xl font-bold mb-4">Blood Stock Management</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => {
                    const item = stock.find(s => s.bloodType === type);
                    return (
                        <div
                            key={type}
                            onClick={() => handleBloodTypeClick(type)}
                            className={`p-4 rounded-lg text-center cursor-pointer transition-transform hover:scale-105 ${item?.quantity > 0 ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'}`}
                        >
                            <div className="font-bold text-lg">{type}</div>
                            <div className="text-2xl">{item?.quantity || 0} units</div>
                            <div className="text-xs text-gray-500 mt-1">Click to view details</div>
                        </div>
                    );
                })}
            </div>

            <form onSubmit={handleUpdate} className="flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded-lg">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                    <select
                        className="input-field"
                        value={updateData.bloodType}
                        onChange={(e) => setUpdateData({ ...updateData, bloodType: e.target.value, donorId: '' })}
                    >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <select
                        className="input-field"
                        value={updateData.action}
                        onChange={(e) => setUpdateData({ ...updateData, action: e.target.value })}
                    >
                        <option value="add">Add</option>
                        <option value="subtract">Remove</option>
                    </select>
                </div>

                {updateData.action === 'add' && (
                    <div className="w-full flex gap-4 mb-2 border-b pb-2">
                        <button
                            type="button"
                            onClick={() => setUpdateData({ ...updateData, isManual: false, donorId: '', manualDonorName: '', manualDonorPhone: '' })}
                            className={`px-3 py-1 rounded text-sm ${!updateData.isManual ? 'bg-primary-100 text-primary-700 font-bold' : 'text-gray-500'}`}
                        >
                            Registered Donor
                        </button>
                        <button
                            type="button"
                            onClick={() => setUpdateData({ ...updateData, isManual: true, donorId: '', manualDonorName: '', manualDonorPhone: '' })}
                            className={`px-3 py-1 rounded text-sm ${updateData.isManual ? 'bg-primary-100 text-primary-700 font-bold' : 'text-gray-500'}`}
                        >
                            Manual Entry (Unregistered)
                        </button>
                    </div>
                )}

                {updateData.action === 'add' && !updateData.isManual && (
                    <div className="min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700">Select Donor</label>
                        <select
                            className="input-field w-full"
                            value={updateData.donorId}
                            onChange={(e) => setUpdateData({ ...updateData, donorId: e.target.value })}
                            required={!updateData.isManual}
                        >
                            <option value="">Select Registered Donor</option>
                            {availableDonorsForType.length > 0 ? (
                                availableDonorsForType.map(donor => (
                                    <option key={donor._id} value={donor._id}>
                                        {donor.name} ({donor.email})
                                    </option>
                                ))
                            ) : (
                                <option disabled>No registered donors found with {updateData.bloodType}</option>
                            )}
                        </select>
                    </div>
                )}

                {updateData.action === 'add' && updateData.isManual && (
                    <>
                        <div className="min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700">Donor Name</label>
                            <input
                                type="text"
                                className="input-field w-full"
                                placeholder="Enter Name"
                                value={updateData.manualDonorName || ''}
                                onChange={(e) => setUpdateData({ ...updateData, manualDonorName: e.target.value })}
                                required={updateData.isManual}
                            />
                        </div>
                        <div className="min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700">Donor Phone</label>
                            <input
                                type="tel"
                                className="input-field w-full"
                                placeholder="Enter Phone"
                                value={updateData.manualDonorPhone || ''}
                                onChange={(e) => setUpdateData({ ...updateData, manualDonorPhone: e.target.value })}
                                required={updateData.isManual}
                            />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                        type="number"
                        min="1"
                        className="input-field w-24"
                        value={updateData.quantity}
                        onChange={(e) => setUpdateData({ ...updateData, quantity: e.target.value })}
                    />
                </div>

                <div className="w-full mt-2">
                    <button type="submit" className="btn-primary w-full md:w-auto">
                        {updateData.action === 'add' ? 'Add to Stock' : 'Update Stock'}
                    </button>
                </div>
            </form>

            {/* Units/Donors Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h3 className="text-lg font-bold">Manage: <span className="text-red-600">{selectedBloodType}</span></h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b">
                            <button
                                className={`flex-1 py-3 px-4 font-medium text-center ${activeTab === 'stock' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('stock')}
                            >
                                Available Stock ({units.length})
                            </button>
                            <button
                                className={`flex-1 py-3 px-4 font-medium text-center ${activeTab === 'donors' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('donors')}
                            >
                                All Registered Donors ({potentialDonorsForModal.length})
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            {activeTab === 'stock' ? (
                                // Stock View
                                loadingUnits ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                                        <p>Loading units...</p>
                                    </div>
                                ) : units.length > 0 ? (
                                    <div className="space-y-4">
                                        {units.map((unit, index) => (
                                            <div key={unit._id} className="border rounded-lg p-4 hover:bg-gray-50 flex gap-4 items-start">
                                                <div className="bg-red-100 text-red-800 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 mt-1">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-xs font-mono text-gray-500">ID: {unit._id.slice(-6)}</span>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${unit.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {unit.status}
                                                        </span>
                                                    </div>

                                                    {unit.donorId ? (
                                                        <div className="mt-2">
                                                            <h4 className="font-bold text-lg">{unit.donorId.name}</h4>
                                                            <div className="text-sm text-gray-600 space-y-1 mt-1">
                                                                <div className="flex items-center gap-2">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                                    </svg>
                                                                    {unit.donorId.city || 'No City'}, {unit.donorId.address || 'No Address'}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                                    </svg>
                                                                    {unit.donorId.phone}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 border-t pt-2">
                                                                    <span>Added: {new Date(unit.donationDate).toLocaleDateString()}</span>
                                                                    <span>•</span>
                                                                    <span>Expires: {unit.expiryDate ? new Date(unit.expiryDate).toLocaleDateString() : 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : unit.manualDonorName ? (
                                                        <div className="mt-2">
                                                            <h4 className="font-bold text-lg flex items-center gap-2">
                                                                {unit.manualDonorName}
                                                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Manual Entry</span>
                                                            </h4>
                                                            <div className="text-sm text-gray-600 space-y-1 mt-1">
                                                                <div className="flex items-center gap-2">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                                    </svg>
                                                                    {unit.manualDonorPhone || 'No Phone'}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 border-t pt-2">
                                                                    <span>Added: {new Date(unit.donationDate).toLocaleDateString()}</span>
                                                                    <span>•</span>
                                                                    <span>Expires: {unit.expiryDate ? new Date(unit.expiryDate).toLocaleDateString() : 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2 text-gray-500 italic">
                                                            Unknown Donor (Legacy Stock)
                                                        </div>
                                                    )}
                                                </div>

                                                {unit.donorId && (
                                                    <button
                                                        onClick={() => handleNotify(unit.donorId)}
                                                        className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium text-sm flex items-center gap-2 self-center flex-shrink-0"
                                                        title="Send Notification"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                                        </svg>
                                                        Notify
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No available units found for {selectedBloodType}</p>
                                    </div>
                                )
                            ) : (
                                // All Potential Donors View
                                <div className="space-y-4">
                                    {potentialDonorsForModal.length > 0 ? (
                                        potentialDonorsForModal.map(donor => (
                                            <div key={donor._id} className="border rounded-lg p-4 hover:bg-gray-50 flex justify-between items-center group">
                                                <div>
                                                    <h4 className="font-bold text-lg">{donor.name}</h4>
                                                    <div className="text-sm text-gray-600">
                                                        <div>{donor.email}</div>
                                                        <div>{donor.phone}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{donor.city}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleNotify(donor)}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium text-sm flex items-center gap-2"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                                    </svg>
                                                    Notify
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No registered donors found for {selectedBloodType}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t bg-gray-50 rounded-b-lg text-right">
                            <button onClick={closeModal} className="btn-secondary">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BloodStockManager;
