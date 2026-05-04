const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Ensirat DApp Tests", function () {
  let simpleEqub, simpleIddir, reputation;
  let owner, addr1, addr2, addr3, addr4;
  let fee = ethers.utils.parseEther("0.1");
  let monthlyFee = ethers.utils.parseEther("0.05");
  let maxPayout = ethers.utils.parseEther("1.0");

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    // Deploy SimpleEqub
    const SimpleEqub = await ethers.getContractFactory("SimpleEqub");
    simpleEqub = await SimpleEqub.deploy();
    await simpleEqub.deployed();

    // Deploy SimpleIddir
    const SimpleIddir = await ethers.getContractFactory("SimpleIddir");
    simpleIddir = await SimpleIddir.deploy();
    await simpleIddir.deployed();

    // Deploy Reputation
    const Reputation = await ethers.getContractFactory("Reputation");
    reputation = await Reputation.deploy();
    await reputation.deployed();
  });

  describe("SimpleEqub", function () {
    it("Should create an Equb group successfully", async function () {
      const members = [addr1.address, addr2.address, addr3.address];
      const cycleDuration = 30 * 86400; // 30 days

      await expect(
        simpleEqub.connect(addr1).createGroup(members, fee, cycleDuration)
      )
        .to.emit(simpleEqub, "GroupCreated")
        .withArgs(0, addr1.address, fee, cycleDuration);

      const groupInfo = await simpleEqub.getGroupInfo(0);
      expect(groupInfo.members).to.deep.equal(members);
      expect(groupInfo.fee).to.equal(fee);
      expect(groupInfo.active).to.be.true;
    });

    it("Should fail to create group with less than 2 members", async function () {
      const members = [addr1.address];
      const cycleDuration = 30 * 86400;

      await expect(
        simpleEqub.connect(addr1).createGroup(members, fee, cycleDuration)
      ).to.be.revertedWith("Minimum 2 members required");
    });

    it("Should allow members to pay fees and distribute payout", async function () {
      const members = [addr1.address, addr2.address];
      const cycleDuration = 30 * 86400;

      await simpleEqub.connect(addr1).createGroup(members, fee, cycleDuration);

      // First member pays
      await expect(
        simpleEqub.connect(addr1).payFee(0, { value: fee })
      )
        .to.emit(simpleEqub, "PaymentMade")
        .withArgs(0, addr1.address, fee);

      // Second member pays (should trigger payout)
      await expect(
        simpleEqub.connect(addr2).payFee(0, { value: fee })
      )
        .to.emit(simpleEqub, "PayoutSent");

      // Check that payout was sent to first member
      const balanceBefore = await ethers.provider.getBalance(addr1.address);
      expect(balanceBefore).to.be.gt(ethers.utils.parseEther("99.9")); // Should have received payout
    });

    it("Should prevent non-members from paying fees", async function () {
      const members = [addr1.address, addr2.address];
      const cycleDuration = 30 * 86400;

      await simpleEqub.connect(addr1).createGroup(members, fee, cycleDuration);

      await expect(
        simpleEqub.connect(addr3).payFee(0, { value: fee })
      ).to.be.revertedWith("Not a member of this group");
    });
  });

  describe("SimpleIddir", function () {
    it("Should create an Iddir group successfully", async function () {
      const members = [addr1.address, addr2.address, addr3.address];

      await expect(
        simpleIddir.connect(addr1).createGroup(members, monthlyFee, maxPayout)
      )
        .to.emit(simpleIddir, "GroupCreated")
        .withArgs(0, addr1.address, monthlyFee, maxPayout);

      const groupInfo = await simpleIddir.getGroupInfo(0);
      expect(groupInfo.members).to.deep.equal(members);
      expect(groupInfo.monthlyFee).to.equal(monthlyFee);
      expect(groupInfo.maxPayout).to.equal(maxPayout);
      expect(groupInfo.active).to.be.true;
    });

    it("Should fail to create group with less than 3 members", async function () {
      const members = [addr1.address, addr2.address];

      await expect(
        simpleIddir.connect(addr1).createGroup(members, monthlyFee, maxPayout)
      ).to.be.revertedWith("Minimum 3 members required");
    });

    it("Should allow members to pay monthly fees", async function () {
      const members = [addr1.address, addr2.address, addr3.address];

      await simpleIddir.connect(addr1).createGroup(members, monthlyFee, maxPayout);

      await expect(
        simpleIddir.connect(addr1).payMonthlyFee(0, { value: monthlyFee })
      )
        .to.emit(simpleIddir, "MonthlyPayment")
        .withArgs(0, addr1.address, monthlyFee);
    });

    it("Should allow members to request and vote on payouts", async function () {
      const members = [addr1.address, addr2.address, addr3.address];
      const payoutAmount = ethers.utils.parseEther("0.5");

      await simpleIddir.connect(addr1).createGroup(members, monthlyFee, maxPayout);

      // Request payout
      await expect(
        simpleIddir.connect(addr1).requestPayout(0, "John Doe", payoutAmount)
      )
        .to.emit(simpleIddir, "PayoutRequested")
        .withArgs(0, 0, addr1.address, "John Doe", payoutAmount);

      // Vote on payout
      await expect(
        simpleIddir.connect(addr2).voteOnPayout(0, true)
      )
        .to.emit(simpleIddir, "VoteCast")
        .withArgs(0, addr2.address, true);

      await expect(
        simpleIddir.connect(addr3).voteOnPayout(0, true)
      )
        .to.emit(simpleIddir, "PayoutApproved")
        .withArgs(0, addr1.address, payoutAmount);
    });

    it("Should prevent double voting", async function () {
      const members = [addr1.address, addr2.address, addr3.address];
      const payoutAmount = ethers.utils.parseEther("0.5");

      await simpleIddir.connect(addr1).createGroup(members, monthlyFee, maxPayout);
      await simpleIddir.connect(addr1).requestPayout(0, "John Doe", payoutAmount);

      // First vote
      await simpleIddir.connect(addr2).voteOnPayout(0, true);

      // Second vote should fail
      await expect(
        simpleIddir.connect(addr2).voteOnPayout(0, false)
      ).to.be.revertedWith("Already voted");
    });
  });

  describe("Reputation", function () {
    it("Should initialize user with default reputation score", async function () {
      await reputation.connect(addr1).initializeUser(addr1.address);
      
      const score = await reputation.getReputationScore(addr1.address);
      expect(score).to.equal(50);
    });

    it("Should increase reputation for on-time payments", async function () {
      await reputation.connect(addr1).initializeUser(addr1.address);
      
      await reputation.recordOnTimePayment(addr1.address, fee, "equb");
      
      const score = await reputation.getReputationScore(addr1.address);
      expect(score).to.equal(55);
    });

    it("Should decrease reputation for missed payments", async function () {
      await reputation.connect(addr1).initializeUser(addr1.address);
      
      await reputation.recordMissedPayment(addr1.address, "equb");
      
      const score = await reputation.getReputationScore(addr1.address);
      expect(score).to.equal(30);
    });

    it("Should cap reputation score at 100", async function () {
      await reputation.connect(addr1).initializeUser(addr1.address);
      
      // Add many on-time payments to test cap
      for (let i = 0; i < 20; i++) {
        await reputation.recordOnTimePayment(addr1.address, fee, "equb");
      }
      
      const score = await reputation.getReputationScore(addr1.address);
      expect(score).to.equal(100);
    });

    it("Should floor reputation score at 0", async function () {
      await reputation.connect(addr1).initializeUser(addr1.address);
      
      // Add many missed payments to test floor
      for (let i = 0; i < 10; i++) {
        await reputation.recordMissedPayment(addr1.address, "equb");
      }
      
      const score = await reputation.getReputationScore(addr1.address);
      expect(score).to.equal(0);
    });

    it("Should track payment statistics correctly", async function () {
      await reputation.connect(addr1).initializeUser(addr1.address);
      
      // Add some payments
      await reputation.recordOnTimePayment(addr1.address, fee, "equb");
      await reputation.recordOnTimePayment(addr1.address, fee, "iddir");
      await reputation.recordMissedPayment(addr1.address, "equb");
      
      const stats = await reputation.getPaymentStats(addr1.address);
      expect(stats.totalPayments).to.equal(3);
      expect(stats.onTimePayments).to.equal(2);
      expect(stats.missedPayments).to.equal(1);
      expect(stats.reputationScore).to.equal(40);
    });

    it("Should correctly identify good and excellent reputation", async function () {
      await reputation.connect(addr1).initializeUser(addr1.address);
      
      // Test good reputation (70+)
      for (let i = 0; i < 5; i++) {
        await reputation.recordOnTimePayment(addr1.address, fee, "equb");
      }
      let hasGood = await reputation.hasGoodReputation(addr1.address);
      expect(hasGood).to.be.true;
      
      // Test excellent reputation (90+)
      for (let i = 0; i < 5; i++) {
        await reputation.recordOnTimePayment(addr1.address, fee, "equb");
      }
      let hasExcellent = await reputation.hasExcellentReputation(addr1.address);
      expect(hasExcellent).to.be.true;
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete Equb lifecycle", async function () {
      const members = [addr1.address, addr2.address];
      const cycleDuration = 30 * 86400;

      // Create group
      await simpleEqub.connect(addr1).createGroup(members, fee, cycleDuration);

      // Initialize reputation
      await reputation.connect(addr1).initializeUser(addr1.address);
      await reputation.connect(addr2).initializeUser(addr2.address);

      // Members pay fees
      await simpleEqub.connect(addr1).payFee(0, { value: fee });
      await simpleEqub.connect(addr2).payFee(0, { value: fee });

      // Record on-time payments
      await reputation.recordOnTimePayment(addr1.address, fee, "equb");
      await reputation.recordOnTimePayment(addr2.address, fee, "equb");

      // Check reputation scores
      const score1 = await reputation.getReputationScore(addr1.address);
      const score2 = await reputation.getReputationScore(addr2.address);
      expect(score1).to.equal(55);
      expect(score2).to.equal(55);
    });

    it("Should handle complete Iddir lifecycle", async function () {
      const members = [addr1.address, addr2.address, addr3.address];
      const payoutAmount = ethers.utils.parseEther("0.5");

      // Create group
      await simpleIddir.connect(addr1).createGroup(members, monthlyFee, maxPayout);

      // Initialize reputation
      await reputation.connect(addr1).initializeUser(addr1.address);
      await reputation.connect(addr2).initializeUser(addr2.address);
      await reputation.connect(addr3).initializeUser(addr3.address);

      // Members pay monthly fees
      await simpleIddir.connect(addr1).payMonthlyFee(0, { value: monthlyFee });
      await simpleIddir.connect(addr2).payMonthlyFee(0, { value: monthlyFee });
      await simpleIddir.connect(addr3).payMonthlyFee(0, { value: monthlyFee });

      // Record on-time payments
      await reputation.recordOnTimePayment(addr1.address, monthlyFee, "iddir");
      await reputation.recordOnTimePayment(addr2.address, monthlyFee, "iddir");
      await reputation.recordOnTimePayment(addr3.address, monthlyFee, "iddir");

      // Request and approve payout
      await simpleIddir.connect(addr1).requestPayout(0, "John Doe", payoutAmount);
      await simpleIddir.connect(addr2).voteOnPayout(0, true);
      await simpleIddir.connect(addr3).voteOnPayout(0, true);

      // Check reputation scores
      const score1 = await reputation.getReputationScore(addr1.address);
      const score2 = await reputation.getReputationScore(addr2.address);
      const score3 = await reputation.getReputationScore(addr3.address);
      expect(score1).to.equal(55);
      expect(score2).to.equal(55);
      expect(score3).to.equal(55);
    });
  });
});
