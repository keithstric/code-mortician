
let generationPromiseResolve;
let generationPromiseReject;
let generationPromise = new Promise((resolve, reject) => {
	generationPromiseResolve = resolve;
	generationPromiseReject = reject;
});

export class Application {
	/**
	 * Files processed during initial scanning
	 * @type {string[]}
	 */
	public sourceFiles: Array<string>;

	constructor(options?: Object) {}

	protected generate(): Promise<{}> {
		process.on('unhandledRejection', this.unhandledRejectionListener);
		process.on('uncaughtException', this.uncaughtExceptionListener);
		return generationPromise;
	}

	private unhandledRejectionListener(err, p) {
		console.log('Unhandled Rejection at:', p, 'reason:', err);
		process.exit(1);
	}

	private uncaughtExceptionListener(err) {
		console.log('Uncaught Exception', err);
	}
}