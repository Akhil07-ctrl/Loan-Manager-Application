import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { FaSearch, FaFilter, FaSpinner, FaCheckCircle, FaTimesCircle, FaEdit } from 'react-icons/fa';
import Modal from 'react-modal';
import { CgClose } from "react-icons/cg";

Modal.setAppElement('#root');

const LoansList = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [processingLoan, setProcessingLoan] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, [currentPage, statusFilter]);

  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = Cookies.get('jwtToken');
      const response = await fetch(`/api/admin/loans?page=${currentPage}&status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch loans');
      }
      
      const data = await response.json();
      setLoans(data.loans);
      setTotalPages(data.totalPages);
      setCurrentPage(Number(data.currentPage));
    } catch (error) {
      console.error('Error fetching loans:', error);
      setError('Failed to load loans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    // This would typically involve sending the search query to the server
    console.log('Searching for:', searchQuery);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openLoanModal = (loan) => {
    setSelectedLoan(loan);
    setProcessingStatus('');
    setNotes('');
    setIsModalOpen(true);
  };

  const closeLoanModal = () => {
    setIsModalOpen(false);
    setSelectedLoan(null);
  };

  const handleProcessLoan = async () => {
    if (!selectedLoan || !processingStatus) return;
    
    setProcessingLoan(true);
    
    try {
      const token = Cookies.get('jwtToken');
      const response = await fetch(`/api/admin/loans/${selectedLoan._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: processingStatus,
          notes: notes
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update loan status');
      }
      
      // Update the loan in the local state
      setLoans(prevLoans => 
        prevLoans.map(loan => 
          loan._id === selectedLoan._id 
            ? { ...loan, status: processingStatus, notes: notes } 
            : loan
        )
      );
      
      closeLoanModal();
      // Optionally refresh the loans list
      fetchLoans();
    } catch (error) {
      console.error('Error processing loan:', error);
      alert('Failed to update loan status. Please try again.');
    } finally {
      setProcessingLoan(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && loans.length === 0) {
    return (
      <div className="loans-loading">
        <FaSpinner className="spinner" />
        <p>Loading loans...</p>
      </div>
    );
  }

  return (
    <div className="loans-list-container">
      <div className="loans-header">
        <h2>Manage Loan Applications</h2>
        <div className="loans-controls">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <FaSearch />
              </button>
            </div>
          </form>
          
          <div className="filter-dropdown">
            <button className="filter-button">
              <FaFilter />
              <span>Filter: {statusFilter === 'all' ? 'All' : statusFilter}</span>
            </button>
            <div className="dropdown-content">
              <button onClick={() => handleStatusFilterChange('all')}>All</button>
              <button onClick={() => handleStatusFilterChange('Pending')}>Pending</button>
              <button onClick={() => handleStatusFilterChange('Approved')}>Approved</button>
              <button onClick={() => handleStatusFilterChange('Rejected')}>Rejected</button>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchLoans}>Try Again</button>
        </div>
      )}
      
      {loans.length > 0 ? (
        <div className="loans-table-container">
          <table className="loans-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Applicant</th>
                <th>Purpose</th>
                <th>Amount</th>
                <th>Tenure</th>
                <th>Date Applied</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan._id}>
                  <td>{loan._id.substring(0, 8)}...</td>
                  <td>{loan.fullName}</td>
                  <td>{loan.reason}</td>
                  <td>{formatCurrency(loan.amount)}</td>
                  <td>{loan.tenure} months</td>
                  <td>{formatDate(loan.dateApplied)}</td>
                  <td>
                    <span className={`status-badge ${loan.status.toLowerCase()}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-button"
                      onClick={() => openLoanModal(loan)}
                      title="View/Process Loan"
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="no-loans">
          <p>No loans found matching your criteria.</p>
        </div>
      )}
      
      {/* Loan Processing Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeLoanModal}
        contentLabel="Process Loan Application"
        className="modal-content loan-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>Process Loan Application</h2>
          <button
            onClick={closeLoanModal}
            aria-label="Close"
            className="close-button"
          >
            <CgClose />
          </button>
        </div>
        
        {selectedLoan && (
          <div className="modal-body">
            <div className="loan-details-grid">
              <div className="detail-item">
                <h4>Applicant</h4>
                <p>{selectedLoan.fullName}</p>
              </div>
              <div className="detail-item">
                <h4>Purpose</h4>
                <p>{selectedLoan.reason}</p>
              </div>
              <div className="detail-item">
                <h4>Amount</h4>
                <p>{formatCurrency(selectedLoan.amount)}</p>
              </div>
              <div className="detail-item">
                <h4>Tenure</h4>
                <p>{selectedLoan.tenure} months</p>
              </div>
              <div className="detail-item">
                <h4>Date Applied</h4>
                <p>{formatDate(selectedLoan.dateApplied)}</p>
              </div>
              <div className="detail-item">
                <h4>Current Status</h4>
                <p>
                  <span className={`status-badge ${selectedLoan.status.toLowerCase()}`}>
                    {selectedLoan.status}
                  </span>
                </p>
              </div>
              <div className="detail-item full-width">
                <h4>Employment Address</h4>
                <p>{selectedLoan.employmentAddress}</p>
              </div>
            </div>
            
            <div className="process-loan-form">
              <h3>Update Loan Status</h3>
              
              <div className="status-options">
                <button 
                  className={`status-button approve ${processingStatus === 'Approved' ? 'active' : ''}`}
                  onClick={() => setProcessingStatus('Approved')}
                  disabled={selectedLoan.status !== 'Pending'}
                >
                  <FaCheckCircle /> Approve
                </button>
                <button 
                  className={`status-button reject ${processingStatus === 'Rejected' ? 'active' : ''}`}
                  onClick={() => setProcessingStatus('Rejected')}
                  disabled={selectedLoan.status !== 'Pending'}
                >
                  <FaTimesCircle /> Reject
                </button>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this decision..."
                  rows="3"
                  disabled={selectedLoan.status !== 'Pending'}
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={closeLoanModal} 
                  className="secondary-button"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleProcessLoan} 
                  className="primary-button"
                  disabled={!processingStatus || processingLoan || selectedLoan.status !== 'Pending'}
                >
                  {processingLoan ? <FaSpinner className="spinner-small" /> : 'Submit Decision'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoansList;