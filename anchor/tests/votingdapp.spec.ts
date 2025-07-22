import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Voting } from "../target/types/voting";
import {startAnchor} from "solana-bankrun";
import {BankrunProvider} from "anchor-bankrun"

const IDL = require("../target/idl/voting.json");

const votingAdress = new PublicKey("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H")

describe("Voting", () => {
	let context;
	let provider;
	let votingProgram: Program<Voting>;

	beforeAll(async () => {
		context = await startAnchor("", [{name: "voting", programId: votingAdress}], []);
		provider = new BankrunProvider(context);

		votingProgram = new Program<Voting>(
			IDL,
			provider
		);
	});

	it("Initialize Poll", async () => {
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

		expect(poll.pollId.toNumber()).toEqual(1);
		expect(poll.description).toEqual("What is your favorite type of peanut butter?");
		expect(poll.pollStart.toNumber()).toEqual(1748736000);
		expect(poll.pollEnd.toNumber()).toEqual(1756684799);
		expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());

	});

	it("Initialize Candidate", async () => {
		await votingProgram.methods.initializeCandidate("Smooth", new anchor.BN(1)).rpc();
		await votingProgram.methods.initializeCandidate("Crunchy", new anchor.BN(1)).rpc();

		const [[crunchyAddress], [smoothAddress]] = [
			PublicKey.findProgramAddressSync(
				[new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Crunchy")],
				votingAdress
			),
			PublicKey.findProgramAddressSync(
				[new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Smooth")],
				votingAdress
			)
		];

		const [pollAdress] = PublicKey.findProgramAddressSync(
			[new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
			votingAdress
		);

		const poll = await votingProgram.account.poll.fetch(pollAdress);

		const [crunchyCandidate, smoothCandidate] = await Promise.all([
			votingProgram.account.candidate.fetch(crunchyAddress),
			votingProgram.account.candidate.fetch(smoothAddress)
		]);

		expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0);
		expect(crunchyCandidate.candidateName).toEqual("Crunchy");

		expect(smoothCandidate.candidateVotes.toNumber()).toEqual(0);
		expect(smoothCandidate.candidateName).toEqual("Smooth");

		expect(poll.candidateAmount.toNumber()).toEqual(2);
	});

	it ("Vote", async () => {
		await votingProgram.methods.vote("Smooth", new anchor.BN(1)).rpc();

		const [[crunchyAddress], [smoothAddress]] = [
			PublicKey.findProgramAddressSync(
				[new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Crunchy")],
				votingAdress
			),
			PublicKey.findProgramAddressSync(
				[new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Smooth")],
				votingAdress
			)
		];

		const [crunchyCandidate, smoothCandidate] = await Promise.all([
			votingProgram.account.candidate.fetch(crunchyAddress),
			votingProgram.account.candidate.fetch(smoothAddress)
		]);

		expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0);

		expect(smoothCandidate.candidateVotes.toNumber()).toEqual(1);
	}) 
});
