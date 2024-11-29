import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getGameRequestById,
  addNoteToGameRequest,
  processGameRequest,
} from '../../api/gameRequestService';
import { GameRequest, RequestNote } from '../../api/gameRequestService';
import { getAuthUser } from '../../state/authState';

Modal.setAppElement('#root'); // Ensure accessibility

const GameRequestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gameRequest, setGameRequest] = useState<GameRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [staffId, setStaffId] = useState<number | null>(null);

  // Modal states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRefuseModalOpen, setIsRefuseModalOpen] = useState(false);

  const [approvalDetails, setApprovalDetails] = useState({
    price: '',
    quantityInStock: '',
  });

  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchAuthUser = () => {
      try {
        const authUser = getAuthUser();
        if (!authUser || !authUser.staffId) {
          console.error('No authenticated user found or staff ID is missing.');
          setErrorMessage('Failed to retrieve staff ID. Please log in again.');
          return;
        }
        setStaffId(authUser.staffId);
      } catch (error) {
        console.error('Error retrieving authenticated user:', error);
        setErrorMessage('Failed to retrieve staff ID. Please log in again.');
      }
    };

    const fetchRequest = async () => {
      try {
        if (id) {
          const request = await getGameRequestById(parseInt(id));
          setGameRequest(request);
        }
      } catch (error) {
        console.error('Error fetching game request:', error);
        setErrorMessage('Failed to fetch game request details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthUser();
    fetchRequest();
  }, [id]);

  const handleAddNote = async () => {
    if (!noteInput.trim()) {
      setErrorMessage('Note cannot be empty.');
      return;
    }

    try {
      const note: RequestNote = await addNoteToGameRequest(parseInt(id!), {
        content: noteInput,
        staffWriterId: staffId!, // Use dynamic staff ID
        noteDate: new Date().toISOString(),
      });
      setGameRequest({
        ...gameRequest!,
        noteIds: [...gameRequest!.noteIds, note.noteId],
      });
      setNoteInput('');
      setErrorMessage(null);
    } catch (error) {
      console.error('Error adding note:', error);
      setErrorMessage('Failed to add note.');
    }
  };

  const handleProcessRequest = async (approval: boolean) => {
    if (!staffId) {
      setErrorMessage('Staff ID is missing. Please log in again.');
      return;
    }

    try {
      const approvalDto = approval
        ? {
            price: parseFloat(approvalDetails.price),
            quantityInStock: parseInt(approvalDetails.quantityInStock),
            note: noteInput
              ? {
                  content: noteInput,
                  staffWriterId: staffId,
                  noteDate: new Date().toISOString(),
                }
              : undefined,
          }
        : {
            rejectionReason,
            note: noteInput
              ? {
                  content: noteInput,
                  staffWriterId: staffId,
                  noteDate: new Date().toISOString(),
                }
              : undefined,
          };

      const updatedRequest = await processGameRequest(
        parseInt(id!),
        staffId,
        approval,
        approvalDto
      );
      setGameRequest(updatedRequest); // Update the state with the processed request
      setErrorMessage(null);
    } catch (error) {
      console.error('Error processing request:', error);
      setErrorMessage('Failed to process game request.');
    } finally {
      // Close modals after processing
      setIsApproveModalOpen(false);
      setIsRefuseModalOpen(false);
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-600 font-medium">
        Loading game request details...
      </p>
    );

  if (errorMessage)
    return (
      <div className="text-red-500 text-center bg-red-100 border border-red-400 p-4 rounded">
        {errorMessage}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/manager/game-requests')}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md shadow hover:bg-gray-200 transition"
        >
          Back
        </button>
        <h2 className="ml-4 text-2xl font-bold tracking-tight text-gray-900">
          Game Request Details
        </h2>
      </div>

      {gameRequest && (
        <div>
          <div className="bg-white p-6 rounded shadow-md">
            <p className="mb-2">
              <strong className="font-medium text-gray-600">Name:</strong>{' '}
              {gameRequest.name}
            </p>
            <p className="mb-2">
              <strong className="font-medium text-gray-600">
                Description:
              </strong>{' '}
              {gameRequest.description}
            </p>
            <p className="mb-2">
              <strong className="font-medium text-gray-600">Status:</strong>{' '}
              <span
                className={`px-2 py-1 rounded text-white ${
                  gameRequest.requestStatus === 'SUBMITTED'
                    ? 'bg-blue-500'
                    : gameRequest.requestStatus === 'APPROVED'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
              >
                {gameRequest.requestStatus}
              </span>
            </p>
            <p className="mb-4">
              <strong className="font-medium text-gray-600">
                Request Date:
              </strong>{' '}
              {new Date(gameRequest.requestDate).toLocaleDateString()}
            </p>

            <h3 className="text-lg font-medium text-gray-800">Add Note</h3>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="w-full mt-2 border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddNote}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Add Note
            </button>
          </div>

          {gameRequest.requestStatus === 'SUBMITTED' && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setIsApproveModalOpen(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
              >
                Approve
              </button>
              <button
                onClick={() => setIsRefuseModalOpen(true)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Refuse
              </button>
            </div>
          )}
        </div>
      )}

      {/* Approval Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onRequestClose={() => setIsApproveModalOpen(false)}
        className="relative bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Approve Request
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              value={approvalDetails.price}
              onChange={(e) =>
                setApprovalDetails({
                  ...approvalDetails,
                  price: e.target.value,
                })
              }
              className="mt-2 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity in Stock
            </label>
            <input
              type="number"
              value={approvalDetails.quantityInStock}
              onChange={(e) =>
                setApprovalDetails({
                  ...approvalDetails,
                  quantityInStock: e.target.value,
                })
              }
              className="mt-2 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => setIsApproveModalOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleProcessRequest(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Approve
            </button>
          </div>
        </div>
      </Modal>

      {/* Refuse Modal */}
      <Modal
        isOpen={isRefuseModalOpen}
        onRequestClose={() => setIsRefuseModalOpen(false)}
        className="relative bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Refuse Request
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rejection Reason
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={4}
            ></textarea>
          </div>
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => setIsRefuseModalOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleProcessRequest(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Refuse
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GameRequestDetailPage;
