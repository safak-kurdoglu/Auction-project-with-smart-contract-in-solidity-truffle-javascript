App = {

  web3Provider: null,
  contracts: {},
  donatedAmounts : [0,0,0],

  getData: async function() {
    //load datas.
    await axios.get('http://localhost:3000/get-datas').then(resp => {
      App.donatedAmounts = resp.data.donatedAmounts;
    });
    return await App.init();
  },


  init: async function() {
    //getting projects' datas from projects.json file and pass it to index.html
    $.getJSON('../projects.json', function(data) {
      var projectRow = $('#projectsRow');
      var projectTemplate = $('#projectsTemplate');

      for (i = 0; i < data.length; i ++) {
        projectTemplate.find('.panel-title').text(data[i].name);
        projectTemplate.find('.amountIn').text(App.donatedAmounts[i]);
        projectTemplate.find('img').attr('src', data[i].picture);
        projectTemplate.find('.btn-donate').attr('data-id', data[i].id);
        


        projectRow.append(projectTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    //Modern dApp browsers like firefox, chrome, brave have window.ethereum object for provider.
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } 
      catch (error) {
        console.error("User denied account access");
      }
    }
    // This is for legacy dapp browsers, if modern dapp browser is not being used.
    else if(window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }

    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Donation.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var DonationArtifact = data;
      App.contracts.Donation = TruffleContract(DonationArtifact);
    
      // Set the provider for our contract
      App.contracts.Donation.setProvider(App.web3Provider);
    
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-donate', App.handleDonate);
  },

  handleDonate: function(event) {
    event.preventDefault();

     $.getJSON('../projects.json', function(data) {
      projectID = parseInt($(event.target).data('id'));
      amount = parseInt($(".amount")[projectID].value);
      projectAddress = data[projectID].address;
      
    }).then(function() {
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error); 
        }
      
        var account = accounts[0];  
      
        App.contracts.Donation.deployed().then(function(instance) {
          donationInstance = instance;
      
          
          return donationInstance.donate(projectAddress, {from: account, value: amount});
        }).then(function() {
          $(".amountIn")[projectID].innerHTML = parseInt($(".amountIn")[projectID].innerHTML) + amount;
          App.donatedAmounts[projectID] += amount;
          axios.post('http://localhost:3000/update-amounts',{
            donatedAmounts: App.donatedAmounts
          })
          return; 
        }).catch(function(err) {
          console.log(err.message);
        });
      });

    })
}
};

$(function() {
  $(window).load(function() {
    App.getData();
  });
});