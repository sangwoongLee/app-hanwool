import { mysql } from '../modules/database/mysql';
import { HistoryDto } from '@shared/dto';
import { History } from '@shared/dto/history-dto';

const FIND_BY_MONTH =
	'SELECT * FROM history h JOIN category c ON h.category_id=c.category_id JOIN payment p ON h.payment_id=p.payment_id WHERE h.service_id=? and h.history_date between ? and ? AND h.delete_date IS NULL ORDER BY h.history_date';
const FIND_BY_ID =
	'SELECT * FROM history h JOIN category c ON h.category_id=c.category_id JOIN payment p ON h.payment_id=p.payment_id WHERE h.history_id=?';

const create = async (history: HistoryDto.AddHistoryDto): Promise<HistoryDto.History> => {
	let historyData;
	const addHistoryData = {
		service_id: history.service_id,
		price: history.price,
		content: history.content,
		history_date: new Date(history.history_date),
		payment_id: history.payment_id,
		category_id: history.category_id,
	};

	let payment: string;
	let category: string;
	let history_id: number;
	try {
		historyData = await mysql.connect(async (con: any) => {
			let rows;
			rows = await con.query(`INSERT INTO history SET ?`, addHistoryData);
			history_id = rows[0].insertId;

			[rows] = await con.query('SELECT payment_name FROM payment WHERE payment_id=?', [
				history.payment_id,
			]);
			payment = rows[0].payment_name;

			[rows] = await con.query('SELECT category_name FROM category WHERE category_id=?', [
				history.category_id,
			]);
			category = rows[0].category_name;
		});

		const result = {
			id: history_id!,
			price: history.price,
			content: history.content,
			category: category!,
			payment: payment!,
			historyDate: new Date(history.history_date),
		};
		return result;
	} catch (err) {
		throw err;
	}
};

const findByMonth = async ({
	serviceId,
	year,
	month,
}: {
	serviceId: number;
	year: number;
	month: number;
}): Promise<History[]> => {
	const startDate = new Date(year, month - 1, 1, 1, 0, 0, 0);
	const endDate = new Date(year, month, 1, 0, 0, 0);

	const escapeDate = (date: Date) => [date.getFullYear(), date.getMonth() + 1, 1].join('-');
	try {
		const [histories] = await mysql.connect((con: any) =>
			con.query(FIND_BY_MONTH, [serviceId, escapeDate(startDate), escapeDate(endDate)])
		);

		return histories.map((data: any) => ({
			id: data.history_id,
			price: data.price,
			content: data.content,
			historyDate: data.history_date,
			category: data.category_name,
			payment: data.payment_name,
		}));
	} catch (err) {
		throw err;
	}
};

const update = async (historyId: number, history: HistoryDto.EditHistoryDto) => {
	let resultHistory: History;

	try {
		resultHistory = await mysql.connect(async (con: any) => {
			if (Object.keys(history).length !== 0)
				await con.query(`UPDATE history SET ? WHERE history_id=?`, [history, historyId]);

			const [rows] = await con.query(FIND_BY_ID, [historyId]);
			return rows.map((data: any) => ({
				id: data.history_id,
				price: data.price,
				content: data.content,
				historyDate: data.history_date,
				category: data.category_name,
				payment: data.payment_name,
			}))[0];
		});

		return resultHistory;
	} catch (err) {
		throw err;
	}
};

const remove = async (historyId: number): Promise<void> => {
	let historyData;
	try {
		[historyData] = await mysql.connect((con: any) =>
			con.query(`UPDATE history SET delete_date = NOW() WHERE history_id = ?`, [historyId])
		);
	} catch (err) {
		throw err;
	}
};

const bulkInsert = async (histories: HistoryDto.CREATE[]) => {
	let historyData;
	try {
		historyData = await mysql.connect((con: any) => {
			return con.query(
				`INSERT INTO history (price, content, history_date, category_id, payment_id, service_id) VALUES ?`,
				[histories]
			);
		});

		return { affectedRows: historyData[0].affectedRows, insertId: historyData[0].insertId };
	} catch (err) {
		throw err;
	}
};

export default {
	create,
	findByMonth,
	update,
	remove,
	bulkInsert,
};
