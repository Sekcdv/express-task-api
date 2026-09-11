import 'dotenv/config';
import { app } from './app.js';
const portValue = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(portValue) || portValue <= 0) {
    throw new Error('PORT debe ser un entero positivo.');
}
app.listen(portValue, () => {
    console.log(`API disponible en http://localhost:${portValue}`);
});