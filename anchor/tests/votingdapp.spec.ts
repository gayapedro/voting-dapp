import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Voting } from "../target/types/voting";
import {startAnchor} from "solana-bankrun";
import {BankrunProvider} from "anchor-bankrun"

const IDL = require("../target/idl/voting.json");

const votingAdress = new PublicKey("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H")

describe("Voting", () => {
	it("Initialize Poll", async () => {
		const context = await startAnchor("", [{name: "voting", programId: votingAdress}], []);
		const provider = new BankrunProvider(context);

		const votingProgram = new Program<Voting>(
			IDL,
			provider
		);

		await votingProgram.methods.initializePoll(
			new anchor.BN(1), 
			"What is your favorite type of peanut butter?",
			new anchor.BN(1748736000),
			new anchor.BN(1756684799)
		).rpc();

		const [pollAdress] = PublicKey.findProgramAddressSync(
			[new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
			votingAdress
		);

		const poll = await votingProgram.account.poll.fetch(pollAdress);

		console.log(poll);

		expect(poll.pollId.toNumber()).toEqual(1);
		expect(poll.description).toEqual("What is your favorite type of peanut butter?");
		expect(poll.pollStart.toNumber()).toEqual(1748736000);
		expect(poll.pollEnd.toNumber()).toEqual(1756684799);
		expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());

	});
});
