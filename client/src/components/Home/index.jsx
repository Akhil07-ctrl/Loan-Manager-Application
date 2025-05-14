import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import Header from "../../components/Header";
import Modal from 'react-modal';
import { CgClose } from "react-icons/cg";
import axios from 'axios';
import { FaUserCircle, FaSearch, FaSortAmountDown, FaFilter, FaMoneyBillWave, FaExchangeAlt, FaPiggyBank, FaTimes } from "react-icons/fa";

import "./index.css";

Modal.setAppElement('#root');

// Local storage key for loans
const LOANS_STORAGE_KEY = 'loanManagerLoans';

const Home = () => {
  const [username, setUsername] = useState("");
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loans, setLoans] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isWithdrawConfirmOpen, setIsWithdrawConfirmOpen] = useState(false);
  const [loanToWithdraw, setLoanToWithdraw] = useState(null);
  
  // Application form state
  const [loanApplication, setLoanApplication] = useState({
    fullName: "",
    amount: "",
    tenure: "",
    reason: "",
    employmentAddress: ""
  });

  // Fetch loans from the server
  useEffect(() => {
    document.title = `Home | Loan Manager`;
    fetchUserLoans();
  }, []);
  
  // Function to fetch user loans from the server
  const fetchUserLoans = async () => {
    try {
      const token = Cookies.get('jwtToken');
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      
      const response = await axios.get('/api/loans/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setLoans(response.data);
      }
    } catch (error) {
      console.error("Error fetching user loans:", error);
      // If there's an error, we can use mock data as fallback
      const mockLoans = [
        { id: 1, name: "Personal Loan", amount: 5000, dateApplied: "2023-10-15", status: "Approved" },
        { id: 2, name: "Home Improvement", amount: 10000, dateApplied: "2023-09-22", status: "Pending" },
        { id: 3, name: "Education Loan", amount: 8000, dateApplied: "2023-11-05", status: "Rejected" },
      ];
      setLoans(mockLoans);
    }
  };

  useEffect(() => {
    const token = Cookies.get('jwtToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.username);
      } catch (error) {
        console.error("Failed to decode token:", error.message);
      }
    }
  }, []);

  const openLoanModal = () => {
    setIsLoanModalOpen(true);
  };

  const closeLoanModal = () => {
    setIsLoanModalOpen(false);
  };

  const openApplicationModal = () => {
    closeLoanModal();
    setIsApplicationModalOpen(true);
  };

  const closeApplicationModal = () => {
    setIsApplicationModalOpen(false);
  };

  const openWithdrawConfirm = (loan) => {
    setLoanToWithdraw(loan);
    setIsWithdrawConfirmOpen(true);
  };

  const closeWithdrawConfirm = () => {
    setIsWithdrawConfirmOpen(false);
    setLoanToWithdraw(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    setLoanApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplicationSubmit = async(e) => {
    e.preventDefault();
    
    // Validate form data
    const amount = parseFloat(loanApplication.amount);
    if (isNaN(amount) || amount < 1000 || amount > 50000) {
      alert("Please enter a valid loan amount between $1,000 and $50,000");
      return;
    }
    
    const tenure = parseInt(loanApplication.tenure);
    if (isNaN(tenure) || tenure < 6 || tenure > 60) {
      alert("Please enter a valid loan tenure between 6 and 60 months");
      return;
    }
    
    try {
      // Create loan data to send to the server
      const loanData = {
        fullName: loanApplication.fullName,
        amount: amount,
        tenure: tenure,
        reason: loanApplication.reason,
        employmentAddress: loanApplication.employmentAddress
      };
      
      const token = Cookies.get('jwtToken');
      const response = await axios.post('/api/loans', loanData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.status === 201) {
        // Fetch the updated loans from the server
        fetchUserLoans();
        
        // Reset the form and close the modal
        setLoanApplication({
          fullName: "",
          amount: "",
          tenure: "",
          reason: "",
          employmentAddress: ""
        });
        
        closeApplicationModal();
      }
    } catch (error) {
      console.error("Error submitting loan application:", error);
      alert("Failed to submit loan application. Please try again.");
    }
  };

  const handleWithdrawLoan = async () => {
    if (loanToWithdraw) {
      try {
        // Only allow withdrawal if the loan has an _id (server data) and is pending
        if (loanToWithdraw._id && loanToWithdraw.status === 'Pending') {
          const token = Cookies.get('jwtToken');
          await axios.delete(`/api/loans/${loanToWithdraw._id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          // Refresh the loans list from the server
          fetchUserLoans();
        } else {
          // For mock data or non-pending loans, just update the UI
          setLoans(prevLoans => {
            if (!Array.isArray(prevLoans)) return [];
            const idField = loanToWithdraw._id ? '_id' : 'id';
            return prevLoans.filter(loan => loan[idField] !== loanToWithdraw[idField]);
          });
        }
        
        closeWithdrawConfirm();
      } catch (error) {
        console.error("Error withdrawing loan:", error);
        alert("Failed to withdraw loan. Please try again.");
      }
    }
  };

  // Filter and sort loans
  const filteredLoans = Array.isArray(loans) ? loans
    .filter(loan => {
      // Filter by search query
      if (searchQuery) {
        // Check if loan has reason property (from server) or name property (from mock data)
        const loanName = loan.reason || loan.name || '';
        return loanName.toLowerCase().includes(searchQuery.toLowerCase());
      }
      // Filter by status
      if (filterStatus !== "all") {
        return loan.status.toLowerCase() === filterStatus.toLowerCase();
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by date
      // Use createdAt from server data or dateApplied from mock data
      const dateA = new Date(a.createdAt || a.dateApplied);
      const dateB = new Date(b.createdAt || b.dateApplied);
      return sortOrder === "asc" 
        ? dateA - dateB 
        : dateB - dateA;
    }) : [];

  return (
    <div className="home">
      <Header />
      
      <div className="welcome-section">
        <h1>Hi {username}!</h1>
        <p>Welcome to the Loan Management System</p>
      </div>
      
      <div className="user-actions">

        <div className="user-profile">
          <button 
            type="button" 
            className="primary-button"
            onClick={openLoanModal}
          >
            Get a Loan
          </button>
        </div>
        
        <div className="quick-actions">
          <button type="button" className="action-button">
            <FaMoneyBillWave className="action-icon" />
            <span>Borrow Cash</span>
          </button>
          
          <button type="button" className="action-button">
            <FaExchangeAlt className="action-icon" />
            <span>Transact</span>
          </button>
          
          <button type="button" className="action-button">
            <FaPiggyBank className="action-icon" />
            <span>Deposit Cash</span>
          </button>
        </div>
        
      </div>
      
      <div className="search-container">
        <FaSearch className="search-icon" />
        <input 
          type="search" 
          placeholder="Search for loans..." 
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      
      <div className="loans-section">
        <div className="loans-header">
          <h2>Applied Loans</h2>
          <div className="loans-controls">

            <div>
              <button 
                className="control-button"
                onClick={toggleSortOrder}
              >
                <FaSortAmountDown /> 
                <span>Sort {sortOrder === "asc" ? "↑" : "↓"}</span>
              </button>
            </div>
            
            <div className="filter-dropdown">
              <button className="control-button">
                <FaFilter /> 
                <span>Filter</span>
              </button>
              <div className="dropdown-content">
                <button onClick={() => handleFilterChange("all")}>All</button>
                <button onClick={() => handleFilterChange("approved")}>Approved</button>
                <button onClick={() => handleFilterChange("pending")}>Pending</button>
                <button onClick={() => handleFilterChange("rejected")}>Rejected</button>
              </div>
            </div>

          </div>
        </div>
        
        <div className="table-container">
          {filteredLoans.length > 0 ? (
            <table className="loans-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Date Applied</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map(loan => (
                  <tr key={loan._id || loan.id}>
                    <td>{loan.reason || loan.name}</td>
                    <td>${loan.amount.toLocaleString()}</td>
                    <td>{new Date(loan.createdAt || loan.dateApplied).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${loan.status.toLowerCase()}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="withdraw-button"
                        onClick={() => openWithdrawConfirm(loan)}
                        title="Withdraw Loan"
                        disabled={loan.status !== 'Pending'}
                      >
                        <FaTimes />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-loans">No loans found matching your criteria.</p>
          )}
        </div>
      </div>
      
      {/* Rules Modal */}
      <Modal
        isOpen={isLoanModalOpen}
        onRequestClose={closeLoanModal}
        contentLabel="Loan Application Rules"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>Loan Application Rules</h2>
          <button
            onClick={closeLoanModal}
            aria-label="Close"
            className="close-button"
          >
            <CgClose />
          </button>
        </div>
        <div className="modal-body">
          <p>Please review the following rules before applying for a loan:</p>
          <ul>
            <li>You must be at least 18 years old</li>
            <li>Valid ID is required for verification</li>
            <li>Minimum loan amount is $1,000</li>
            <li>Maximum loan amount is $50,000</li>
            <li>Loan term ranges from 6 to 60 months</li>
          </ul>
          <div className="form-actions">
            <button onClick={closeLoanModal} className="secondary-button">Cancel</button>
            <button onClick={openApplicationModal} className="primary-button">Proceed to Application</button>
          </div>
        </div>
      </Modal>
      
      {/* Application Form Modal */}
      <Modal
        isOpen={isApplicationModalOpen}
        onRequestClose={closeApplicationModal}
        contentLabel="Loan Application Form"
        className="modal-content application-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>Application for Loan</h2>
          <button
            onClick={closeApplicationModal}
            aria-label="Close"
            className="close-button"
          >
            <CgClose />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleApplicationSubmit} className="loan-application-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={loanApplication.fullName}
                onChange={handleApplicationChange}
                required
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="amount">Loan Amount ($)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={loanApplication.amount}
                onChange={handleApplicationChange}
                required
                min="1000"
                max="50000"
                placeholder="Enter amount (1,000 - 50,000)"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tenure">Loan Tenure (months)</label>
              <input
                type="number"
                id="tenure"
                name="tenure"
                value={loanApplication.tenure}
                onChange={handleApplicationChange}
                required
                min="6"
                max="60"
                placeholder="Enter tenure (6 - 60 months)"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="reason">Loan Purpose</label>
              <select
                id="reason"
                name="reason"
                value={loanApplication.reason}
                onChange={handleApplicationChange}
                required
              >
                <option value="">Select loan purpose</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Home Improvement">Home Improvement</option>
                <option value="Education Loan">Education Loan</option>
                <option value="Debt Consolidation">Debt Consolidation</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Medical Expenses">Medical Expenses</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="employmentAddress">Employment Address</label>
              <textarea
                id="employmentAddress"
                name="employmentAddress"
                value={loanApplication.employmentAddress}
                onChange={handleApplicationChange}
                required
                placeholder="Enter your employment address"
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={closeApplicationModal} className="secondary-button">Cancel</button>
              <button type="submit" className="primary-button">Submit Application</button>
            </div>
          </form>
        </div>
      </Modal>
      
      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={isWithdrawConfirmOpen}
        onRequestClose={closeWithdrawConfirm}
        contentLabel="Confirm Withdrawal"
        className="modal-content confirm-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>Confirm Loan Withdrawal</h2>
          <button
            onClick={closeWithdrawConfirm}
            aria-label="Close"
            className="close-button"
          >
            <CgClose />
          </button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to withdraw this loan application?</p>
          {loanToWithdraw && (
            <div className="loan-summary">
              <p><strong>Loan Type:</strong> {loanToWithdraw.reason || loanToWithdraw.name}</p>
              <p><strong>Amount:</strong> ${loanToWithdraw.amount.toLocaleString()}</p>
              <p><strong>Status:</strong> {loanToWithdraw.status}</p>
            </div>
          )}
          <p className="warning-text">This action cannot be undone.</p>
          <div className="form-actions">
            <button onClick={closeWithdrawConfirm} className="secondary-button">Cancel</button>
            <button onClick={handleWithdrawLoan} className="danger-button">Withdraw Loan</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Home;
