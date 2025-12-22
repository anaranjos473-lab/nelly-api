const supabase = require('../config/supabaseClient');

const walletController = {
    getBalance: async (req, res) => {
        const { userId } = req.params;
        const { data, error } = await supabase
            .from('usuarios')
            .select('saldo_billetera')
            .eq('id', userId).single();
        if (error) return res.status(500).send(error);
        res.status(200).json({ status: "success", balance: data.saldo_billetera });
    },

    processCancellation: async (req, res) => {
        const { userId, orderAmount } = req.body;
        // Lógica de blindaje: sumar saldo en lugar de devolver efectivo
        const { data: user } = await supabase.from('usuarios').select('saldo_billetera').eq('id', userId).single();
        const nuevoSaldo = parseFloat(user.saldo_billetera) + parseFloat(orderAmount);
        
        await supabase.from('usuarios').update({ saldo_billetera: nuevoSaldo }).eq('id', userId);
        res.status(200).json({ status: "success", message: "Crédito Nelly aplicado", nuevoSaldo });
    }
};

module.exports = walletController;
