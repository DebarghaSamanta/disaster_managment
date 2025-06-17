import axios from 'axios';
import { AidRecord } from '../models/calculator.models.js';

// Utility to simulate JSON logic
function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function getAdjustmentFactors(severity, region) {
    let bufferRange = [0, 5]; // default for mild
    if (severity.toLowerCase() === 'moderate') bufferRange = [5, 10];
    else if (severity.toLowerCase() === 'severe') bufferRange = [10, 20];

    if (['rural', 'tribal'].includes(region.toLowerCase())) {
        bufferRange[0] += 2;
        bufferRange[1] += 5;
    }

    const buffer_percentage = Math.round(getRandomInRange(bufferRange[0], bufferRange[1]));
    const protein_adjustment_factor = getRandomInRange(0.9, 1.3);
    const water_adjustment_factor = getRandomInRange(0.9, 1.2);

    const reasoning = `Factors based on severity "${severity}" and region "${region}". Buffer randomly selected from ${bufferRange[0]}% to ${bufferRange[1]}%.`;

    return {
        buffer_percentage,
        protein_adjustment_factor: parseFloat(protein_adjustment_factor.toFixed(2)),
        water_adjustment_factor: parseFloat(water_adjustment_factor.toFixed(2)),
        reasoning
    };
}

export const predictAid = async (req, res) => {
    try {
        const {
            area_name, area_size, days, disaster_type, severity, region,
            children, adult_males, adult_females, elderly
        } = req.body;

        const area_size_num = parseFloat(area_size);
        const days_num = parseInt(days, 10);
        const children_num = parseInt(children, 10);
        const adult_males_num = parseInt(adult_males, 10);
        const adult_females_num = parseInt(adult_females, 10);
        const elderly_num = parseInt(elderly, 10);

        const total_people = children_num + adult_males_num + adult_females_num + elderly_num;

        if (total_people === 0 || area_size_num <= 0 || days_num <= 0) {
            return res.status(400).json({ error: "Invalid input" });
        }

        const aiOutput = getAdjustmentFactors(severity, region);
        const buffer_percentage = aiOutput.buffer_percentage;
        const protein_factor = aiOutput.protein_adjustment_factor;
        const water_factor = aiOutput.water_adjustment_factor;
        const reasoning = aiOutput.reasoning;

        const dailyNeeds = {
            Rice_kg: 0.4,
            Lentils_kg: 0.1,
            Oil_l: 0.035,
            Salt_kg: 0.005,
            Sugar_kg: 0.01,
            DryFood_kg: 0.05,
            Protein_kg: 0.15,
            Vegetables_kg: 0.2,
            Water_l: 5
        };

        const food = {};
        for (let item in dailyNeeds) {
            let base = dailyNeeds[item];
            if (item === 'Protein_kg') base *= protein_factor;
            if (item === 'Water_l') base *= water_factor;

            let total = total_people * base * days_num * (1 + buffer_percentage / 100);
            food[item] = Math.round(total);
        }

        const non_food = {
            Medicines_Units: Math.round((total_people / 10) * days_num * (1 + buffer_percentage / 100)),
            Sanitary_Napkin_Packets: Math.round((adult_females_num / 7) * days_num * (1 + buffer_percentage / 100))
        };

        const min_water = total_people * 2 * days_num;
        const min_protein = total_people * 0.1 * days_num;
        if (food["Water_l"] < min_water) food["Water_l"] = min_water;
        if (food["Protein_kg"] < min_protein) food["Protein_kg"] = min_protein;

        const result = { food, non_food, buffer_percentage, reasoning };

        const record = {
            timestamp: new Date(),
            area_name,
            area_size: area_size_num,
            region,
            disaster_type,
            severity,
            days: days_num,
            population: {
                children: children_num,
                adult_males: adult_males_num,
                adult_females: adult_females_num,
                elderly: elderly_num,
                total: total_people
            },
            ai_output: aiOutput,
            predicted_aid: result
        };

        await AidRecord.create(record);
        res.json(result);
    } catch (err) {
        console.error("PredictAid Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
