import Register from '../models/register.js';
import mongoose from 'mongoose';
import Apprentice from '../models/apprentice.js';
import Modality from '../models/modality.js';
import bcryptjs from 'bcryptjs';


const httpRegisters = {
    // Listar todos los registros
    listAllRegister: async (req, res) => {
        try {
            const register = await Register.find();
            res.json({ register });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Listar un registro por su ID
    listRegisterById: async (req, res) => {
        const { id } = req.params;
        try {
            const register = await Register.findById(id);
            if (register)
                res.json({ register });
            else
                res.status(404).json({ msg: "Registro no encontrado" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Listar registro por el ID del aprendiz
    listRegisterByApprentice: async (req, res) => {
        const { idApprentice } = req.params;
        // if (!mongoose.isValidObjectId(idApprentice)) {
        //     return res.status(400).json({ success: false, error: 'ID de aprendiz no válido' });
        // }
        try {
            const registers = await Register.find({ idApprentice });
            console.log(`Lista de idaprendices en registros: ${idApprentice}`);
            res.json({ success: true, data: registers });
        } catch (error) {
            console.log(`Error al listar idaprendices en registros: ${idApprentice}`, error);
            res.status(500).json({ error: 'Error al listar idaprendices en registros' });
        }
    },

// Listar registros por ID de ficha
listRegistersByFiche: async (req, res) => {
    const { idFiche } = req.params;
    console.log(`ID de ficha recibido: ${idFiche}`);
    
    try {
      const registers = await Register.aggregate([
        {
          $lookup: {
            from: "apprentices",
            localField: "idApprentice",
            foreignField: "_id",
            as: "apprentice",
          },
        },
        {
          $unwind: "$apprentice",
        },
 
        {
          $match: {
            "apprentice.fiche.idFiche": new mongoose.Types.ObjectId(idFiche),
          },
        },
        {
          $project: {
            _id: 1,
            ficheid:"$apprentice.fiche",
            idApprentice: 1,
            idModality: 1,
            startDate:1,
            endDate:1,
            company:1,
            phoneCompany: 1,
            addressCompany:1,
            owner: 1,
            docAlternative:1,
            hour : 1,
            businessProyectHour: 1,
            productiveProjectHour: 1,
            status: 1,
            mailCompany :1,
          },
        },
      ]);
      console.log(`Registros encontrados: ${JSON.stringify(registers, null, 2)}`);
      res.json({ success: true, data: registers });
    } catch (error) {
      console.log(`Error al listar idfiche en register: ${idFiche}`, error);
      res.status(500).json({ error: "Error al listar idfiche en register" });
    }
  },
    //segunda opcion:
    // listRegistersByFiche:async (req, res) => {
    //     try {
    //         const { IdFicha } = req.params;
    //         let array = [];

    //         // Consulta los registros con el aprendiz y su ficha poblados
    //         const registers = await Register.find().populate('idApprentice');

    //         // Itera sobre cada registro para filtrar por IdFicha
    //         for (let i = 0; i < registers.length; i++) {
    //             const register = registers[i];
    //             const apprenticeFicha = register?.idApprentice?.IdFicha;

    //             if (apprenticeFicha && apprenticeFicha.equals(IdFicha)) {
    //                 array.push(register);
    //             }
    //         }

    //         console.log(`Lista de registros para la ficha ${IdFicha}:`, array);
    //         res.json(array);
    //     } catch (error) {
    //         console.error(`Error al listar los registros para la ficha ${IdFicha}:`, error);
    //         res.status(500).json({ message: error.message });
    //     }
    // },

    // Listar registros por ID de modalidad
    listRegisterByModality: async (req, res) => {
        try {
            const { idModality } = req.params;  //  idModality por parámetro

            const registers = await Register.find({ idModality });

            if (registers.length > 0) {
                res.json(registers);
            } else {
                res.status(404).json({ msg: "No se encontraron registros para esta modalidad" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Listar los registros por fecha de inicio 
    listRegisterByStartDate: async (req, res) => {
        const { startDate } = req.params; // Obtén el valor de StartDate desde los parámetros de consulta

        try {   
            const register = await Register.find({ startDate });
            res.status(200).json(register);
        } catch (error) {
            console.error('Error al listar los registros por fecha de inicio:', error);
            res.status(500).json({ message: 'Error al listar los registros' });
        }
    },


    // Listar los registros por fecha de finalización
    listRegisterByEndDate: async (req, res) => {
        const { endDate } = req.params; // Obtén el valor de StartDate desde los parámetros de consulta

        try {
            const register = await Register.find({ endDate });
            res.status(200).json(register);
        } catch (error) {
            console.error('Error al listar los registros por fecha de finalizacion:', error);
            res.status(500).json({ message: 'Error al listar los registros' });
        }
    },

    // Añadir  Registro:
    addRegister: async (req, res) => {
        const { idApprentice, idModality, startDate, company, phoneCompany, addressCompany, owner, hour, businessProyectHour, productiveProjectHour, mailCompany } = req.body;
        try {
            const start = new Date(startDate);
            const endDate = new Date(start);
            endDate.setMonth(endDate.getMonth() + 6);
            endDate.setDate(endDate.getDate() - 1);

            const newRegister = new Register({ idApprentice, idModality, startDate, endDate, company, phoneCompany, addressCompany, owner, hour, businessProyectHour, productiveProjectHour, mailCompany });
            const RegisterCreate = await newRegister.save();
            res.status(201).json(RegisterCreate);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    // Actualizar los datos del registro 
    updateRegisterById: async (req, res) => {
        const { id } = req.params;
        const { startDate, company, phoneCompany, addressCompany, owner, hour, businessProyectHour, productiveProjectHour, mailCompany } = req.body;
        try {
            const registerID = await Register.findById(id);
            if (!registerID) {
                return res.status(404).json({ msg: "Registro no encontrado" });
            }

            const start = new Date(startDate);
            const endDate = new Date(start);
            endDate.setMonth(endDate.getMonth() + 6);
            endDate.setDate(endDate.getDate() - 1);

            const updatedRegister = await Register.findByIdAndUpdate(
                id, { startDate, endDate, company, phoneCompany, addressCompany, owner, hour, businessProyectHour, productiveProjectHour, mailCompany },
                { new: true }
            );

            console.log('Registro editado correctamente:', updatedRegister);
            res.json(updatedRegister);
        } catch (error) {
            console.log('Error al actualizar registro:', error);
            res.status(400).json({ error: 'Error al actualizar el registro' });
        }
    },

    // Activar un registro
    enableRegister: async (req, res) => {
        const { id } = req.params;
        try {
            await Register.findByIdAndUpdate(id, { estado: 1 });
            res.json({ msg: "Registro activado correctamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Desactivar un registro
    disableDesactivateRegister: async (req, res) => {
        const { id } = req.params;
        try {
            await Register.findByIdAndUpdate(id, { estado: 0 });
            res.json({ msg: "Registro desactivado correctamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    updateRegisterModality: async (req, res) => {
        const { id } = req.params;
        const { idModality, docAlternative } = req.body;
        try {
            const updatedModality = await Register.findByIdAndUpdate(id, { idModality, docAlternative }, { new: true });
            if (!updatedModality) {
                return res.status(404).json({ message: 'Registro no encontrado' });
            }
            res.json({ success: true, data: updatedModality });
        } catch (error) {
            console.log('Error al actualizar modalidad', error);
            res.status(500).json({ error: 'Error al actualizar modalidad' });
        }
    }
};

export default httpRegisters