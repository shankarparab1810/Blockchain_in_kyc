import React, { Component } from "react";
import KycBlockChain from "./contracts/KycBlockChain.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import './bootstrap/css/bootstrap.min.css';
const crypto = require("crypto");

const GetAllBankAccounts = (props) => {
  if (parseInt(props.bankcount) > 0) {
    return (
      <div>
        {props.banks.map((bank) => (
          <p key={bank.key}>{bank.bname}- {bank.address}</p>
        ))}
      </div>
    );
  } else {
    return (
      <div>
        <p>There are no verified Bank Accounts in this network!</p>
      </div>
    );
  }
};

const GetAllBankRequests = (props) => {
  return (
    <div>
      {props.bankrequests.map((request) => (
        <p key={request.key}>
          {request.name} - {request.address} 
        </p>
      ))}
    </div>
  );
};
//tab navigation starts here
const hideAll = () => {
  document.getElementsByClassName("new-customer")[0].style.display = "none";
  document.getElementsByClassName("existing-customer")[0].style.display =
    "none";
  document.getElementsByClassName("existing-customer")[1].style.display =
    "none";
  document.getElementsByClassName("new-bank")[0].style.display = "none";
  document.getElementsByClassName("existing-bank")[0].style.display = "none";
  document.getElementsByClassName("existing-bank")[1].style.display = "none";
  let elements = document.querySelectorAll(".active-button");
  for (var i = 0; i < elements.length; i++) {
    elements[i].classList.remove("active-button");
  }
};
const show = (target) => {
  hideAll();
  document.getElementById(`${target}-button`).classList.add("active-button");
  if (target === "new-customer") {
    document.getElementsByClassName("new-customer")[0].style.display = "block";
  }
  if (target === "existing-customer") {
    document.getElementsByClassName("existing-customer")[0].style.display =
      "block";
    document.getElementsByClassName("existing-customer")[1].style.display =
      "block";
  }
  if (target === "existing-bank") {
    document.getElementsByClassName("existing-bank")[0].style.display = "block";
    document.getElementsByClassName("existing-bank")[1].style.display = "block";
  }
  if (target === "new-bank") {
    document.getElementsByClassName("new-bank")[0].style.display = "block";
  }
};


//setting state values
class App extends Component {
  state = {
    web3: null,
    account: null,
    contract: null,
    name: null,
    aadhar: null,
    pan: null,
    panimg: null,
    getdata: null,
    data_hash: null,
    bname: null,
    bank_verify: null,
    entity: null,
    allaccounts: null,
    allbanks: [],
    bank_count: 0,
    status: null,
    requestAddress: null,
    bankrequests: [],
    aadharVerify: null,
    panVerify: null,
    verified: null,
   // panimg: null,
    aadharimg: null,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = KycBlockChain.networks[networkId];
      const instance = new web3.eth.Contract(
        KycBlockChain.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3,
        account: accounts[0],
        contract: instance,
        allaccounts: accounts,
      });
      this.whoami();
      this.numbanks();
      this.onAccountChanged();
    } catch (error) {
      // alert for the errors
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
    show("new-customer");
  };

  myNameChangeHandler = (event) => {
    this.setState({ name: event.target.value });
  };
  myAadharChangeHandler = (event) => {
    this.setState({ aadhar: event.target.value });
  };
  myPanChangeHandler = (event) => {
    this.setState({ pan: event.target.value });
  };

  myPanimgChangeHandler = (event) => {
    this.setState({ panimg: event.target.value });
  };
  myaadharimgChangeHandler = (event) => {
    this.setState({ aadharimg: event.target.value });
  };

  myBankNameChangeHandler = (event) => {
    this.setState({ bname: event.target.value });
  };

  myDataChangeHandler = (event) => {
    this.setState({ getdata: event.target.value });
  };

  myData1ChangeHandler = (event) => {
    this.setState({ aadharVerify: event.target.value });
  };
  
  myData1imgChangeHandler = (event) => {
    this.setState({ aadharimg: event.target.value });
  };

  myData2imgChangeHandler = (event) => {
    this.setState({ panimg: event.target.value });
  };

  myData2ChangeHandler = (event) => {
    this.setState({ panVerify: event.target.value });
  };

  myVBankChangeHandler = (event) => {
    this.setState({ bank_verify: event.target.value });
  };

  requestAddressChange = (event) => {
    this.setState({ requestAddress: event.target.value });
  };

  onAccountChanged = () => {
    window.ethereum.on("accountsChanged", () => {
      window.location.reload();
    });
  };

  whoami = async () => {
    var { contract } = this.state;
    const cus = await contract.methods
      .isCus()
      .call({ from: this.state.account });
    const org = await contract.methods
      .isOrg()
      .call({ from: this.state.account });

    var who = cus ? "Customer" : org ? "Bank" : "None";
    this.setState({ entity: who });
  };

  createmycustomer = async () => {
    var { contract } = this.state;
    await contract.methods
      .newCustomer(
        this.state.name,
        crypto
          .createHash("sha1")
          .update(this.state.aadhar + this.state.pan + this.state.panimg + this.state.aadharimg)
          .digest("hex"),
        this.state.bank_verify
      )
      .send({ from: this.state.account })
      .then(() => {
        window.alert("You successfully made an account!");
        window.location.reload();
      });
  };

  createmybank = async () => {
    var { contract } = this.state;

    await contract.methods
      .newOrganisation(this.state.bname)
      .send({ from: this.state.account })
      .then(() => {
        window.alert("You are now a verified Bank Entity!");
        window.location.reload();
      });
  };

  verifykycfromcustomer = async () => {
    var { contract } = this.state;
    const response = await contract.methods
      .viewCustomerData(this.state.getdata)
      .call({ from: this.state.account });

    this.setState({ data_hash: response });

    const dhash = crypto
      .createHash("sha1")
      .update(this.state.aadharVerify + this.state.panVerify + this.state.panimg + this.state.aadharimg)
      .digest("hex");

    if (dhash === this.state.data_hash) {
      this.setState({ verified: "Success" });
    } else {
      this.setState({ verified: "Fail" });
    }
  };

  get = async () => {
    var { contract } = this.state;
    var access = await contract.methods
      .isOrg()
      .call({ from: this.state.account });
    if (access) {
      this.verifykycfromcustomer();
    } else {
      window.alert("You are not a verified Bank!");
    }
  };

  create_customer = async (e) => {
    e.preventDefault();
    var { contract } = this.state;
    var access = await contract.methods
      .isCus()
      .call({ from: this.state.account });

    if (!access) {
      this.createmycustomer();
      this.whoami();
    } else {
      window.alert("You already have an account!");
    }
  };

  create_bank = async (e) => {
    e.preventDefault();
    var { contract } = this.state;
    var access = await contract.methods
      .isOrg()
      .call({ from: this.state.account });

    var ifcustomer = await contract.methods
      .isCus()
      .call({ from: this.state.account });

    if (!access && !ifcustomer) {
      this.createmybank();
      this.whoami();
    } else if (ifcustomer) {
      window.alert("Customer entities cannot be a bank!");
    } else {
      window.alert("You are already a bank!");
    }
  };

  modify_data = async (e) => {
    e.preventDefault();
    var { contract } = this.state;
    var confirm = await contract.methods
      .isCus()
      .call({ from: this.state.account });
    if (confirm) {
      await contract.methods
        .modifyCustomerData(
          this.state.name,
          crypto
            .createHash("sha1")
            .update(this.state.name + this.state.aadhar + this.state.pan)
            .digest("hex"),
          this.state.bank_verify
        )
        .send({ from: this.state.account })
        .then(() => {
          window.alert("Data Changed!");
          window.location.reload();
        });
    } else {
      window.alert("You are not permitted to use this function!");
    }
  };

  numbanks = async () => {
    var { contract } = this.state;
    var len = await contract.methods.bankslength().call();
    this.setState({ bank_count: len });
    var banks = [];
    if (parseInt(this.state.bank_count) > 0) {
      for (var i = 0; i < len; i++) {
        banks.push({
          key: i,
          address: await contract.methods.Banks(i).call(),
        });
      }
    }

    this.setState({ allbanks: banks });
  };

  getmystatus = async () => {
    var { contract } = this.state;
    var status = await contract.methods
      .checkStatus()
      .call({ from: this.state.account });

    if (status === "0") {
      this.setState({ status: "Accepted" });
    } else if (status === "1") {
      this.setState({ status: "Rejected" });
    } else if (status === "2") {
      this.setState({ status: "Pending" });
    } else {
      this.setState({ status: "Undefined" });
    }
  };

  viewRequests = async () => {
    var { contract } = this.state;
    var reqs = await contract.methods.viewRequests().call({
      from: this.state.account,
    });
    var all_reqs = [];
    var i = 0;
    for (const req in reqs) {
      all_reqs.push({
        key: i,
        address: reqs[req],
        name: await contract.methods.viewName(reqs[req]).call(),
      });
      i++;
    }
    this.setState({ bankrequests: all_reqs });
  };

  accept = async () => {
    var { contract } = this.state;
    await contract.methods
      .changeStatusToAccepted(this.state.requestAddress)
      .send({ from: this.state.account })
      .then(
        () => {
          window.alert("Status Changed!");
          window.location.reload();
        },
        () => {
          window.alert("You are not authorized!");
        }
      );
  };

  reject = async () => {
    var { contract } = this.state;
    await contract.methods
      .changeStatusToRejected(this.state.requestAddress)
      .send({ from: this.state.account })
      .then(
        () => {
          window.alert("Status Changed!");
          window.location.reload();
        },
        () => {
          window.alert("You are not authorized!");
        }
      );
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div className="App  bg-clr-body">
<nav>
    <ul>
      <div className="bg-clr-div"> Verified Organisation Addresses</div>
      <GetAllBankAccounts bankcount={this.state.bank_count} banks={this.state.allbanks}/>

    </ul>
    
</nav>
  
           
        <div className="navbar-nav nav-clr">
          
          
          <button onClick={() => {
              show("new-bank");
            }}
            id="new-bank-button">
            Add Bank Entity
          </button>
          <button onClick={() => {
              show("existing-bank");
            }}
            id="existing-bank-button">
            Verify Customer
          </button>
          <button class="nav-item col-75"
            onClick={() => {
              show("new-customer");
            }}
            id="new-customer-button">
            New customer
          </button>
          <button onClick={() => {
              show("existing-customer");
            }}
            id="existing-customer-button">
            Verification Status
          </button>
        </div>
          

        <div className="new-customer form-top-padding">
          <form action="." method="" onSubmit={this.create_customer}>
            <fieldset>
           
                <div className="form-title form-bottom-padding">
                <strong> New Customer Registration Form</strong>
                </div>

              <p>
                <label>Customer Name :</label>
                <input type="text" className="form-rounded" onChange={this.myNameChangeHandler} />
              </p>

              <p>
                <label>Adhar Card Number :</label>
                <input type="text" className="form-rounded" onChange={this.myAadharChangeHandler} />
              </p>

              <p>
                <label>Pan Card Number :</label>
                <input type="text" className="form-rounded" onChange={this.myPanChangeHandler} />
              </p>
              
              <p>
                <label>Pan Card :</label>
                <input type="file" className="form-rounded" onChange={this.myPanimgChangeHandler} />
              </p>
              
              <p>
                <label>Aadhar card :</label>
                <input type="file" className="form-rounded" onChange={this.myaadharimgChangeHandler} />
              </p>

              <p>
                <label>
                  Bank Address :{" "}
                </label>
                <input type="text" className="form-rounded" onChange={this.myVBankChangeHandler} />
              </p>
              <p>
                <input type="submit" className="form-rounded" name="submit" value="Create Customer" />
              </p>
            </fieldset>
          </form>
        </div>

        <div className="new-bank">
          <form action="." method="" onSubmit={this.create_bank}>
            <fieldset>
            <div className="form-title form-bottom-padding">
                <strong>Add New Bank Entity</strong>
                </div>
              <p>
                <label>Bank Name :</label>
                <input type="text" className="form-rounded" onChange={this.myBankNameChangeHandler} />
              </p>
              <p>
                <input type="submit" className="form-rounded" name="submit" value="Create bank" />
              </p>
            </fieldset>
          </form>
        </div>

        <div className="existing-customer">
          <br />
          <div>
            <label>
              <strong>View Customer Status</strong>
            </label>
            <p>
              <button className="form-rounded normal-button" onClick={this.getmystatus}>Get Customer Status</button>
            </p>
            <p>Customer Status is: {this.state.status}</p>
          </div>
        </div>

        <div className="existing-customer">
          <form action="." method="" onSubmit={this.modify_data}>
            <fieldset>
            <div className="nav-clr">
            <div className="form-title form-bottom-padding">
                <strong>Update existing customer Details</strong>               
             </div>
              <p>If the KYC verification status is rejected please update the correct information</p></div>
              
              <p>
                <label>Customer Name :</label>
                <input type="text" className="form-rounded" onChange={this.myNameChangeHandler} />
              </p>
              <p>
                <label>Adhar Card Number :</label>
                <input type="text" className="form-rounded" onChange={this.myAadharChangeHandler} />
              </p>
              <p>
                <label>Pan Card Number :</label>
                <input type="text" className="form-rounded" onChange={this.myPanChangeHandler} />
              </p>
              <p>
                <label>Pan Card :</label>
                <input type="file" className="form-rounded" onChange={this.myPanimgChangeHandler} />
              </p>
              
              <p>
                <label>Aadhar card :</label>
                <input type="file" className="form-rounded" onChange={this.myaadharimgChangeHandler} />
              </p>
              <p>
                <label>Bank Address : </label>
                <input type="text" className="form-rounded" onChange={this.myVBankChangeHandler} />
              </p>
              <p>
                <input type="submit" className="form-rounded" name="submit" value="Change Data" />
              </p>
            </fieldset>
          </form>
        </div>

        <div className="existing-bank">
          <fieldset>
          <div className="form-title form-bottom-padding">
                <strong>Requests</strong>
             </div>
            <p>
              <button className="form-rounded normal-button" onClick={this.viewRequests}>User Requests</button>
            </p>
            <GetAllBankRequests bankrequests={this.state.bankrequests} />
            <div className="form-top-padding">
            <p>
              <label>Request Address : </label>
              <input type="text" className="form-rounded" onChange={this.requestAddressChange} />
            </p>

            <p>
              <button onClick={this.accept} className="accept-button form-rounded">
                Accept Request
              </button>

              <button onClick={this.reject} className="reject-button form-rounded">
                Reject Request
              </button>
            </p>
            </div>
          </fieldset>
        </div>

        <div className="existing-bank">
          <br />
          <div>
            <label>
              <strong>Verify Customer Data</strong>
            </label>
            <p>
              <label>Address :</label>
              <input type="text" className="form-rounded" onChange={this.myDataChangeHandler} />
            </p>
            <p>
              <label>Aadhar Number :</label>
              <input type="text" className="form-rounded" onChange={this.myData1ChangeHandler} />
            </p>
            <p>
              <label>Aadhar Card :</label>
              <input type="file" className="form-rounded" onChange={this.myData1imgChangeHandler} />
            </p>
            <p>
              <label>Pan Number : </label>
              <input type="text" className="form-rounded" onChange={this.myData2ChangeHandler} />
            </p>
            <p>
              <label>Pan Card :</label>
              <input type="file" className="form-rounded" onChange={this.myData2imgChangeHandler} />
            </p>
            
            <button className="form-rounded normal-button" onClick={this.get}>Verify</button>
            <p>Verification : {this.state.verified}</p>
          </div>
        </div>      

        <div class="text-center text-white">
          
        </div>
      </div>
    );
  }
}

export default App;

