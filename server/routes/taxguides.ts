import { Router, Request, Response } from 'express';
import { TaxGuide } from '../types';

const router = Router();

const toAppTaxGuide = (guide: any): TaxGuide => ({
    ...guide,
    dueDate: guide.dueDate.toISOString(),
    uploadedAt: guide.uploadedAt.toISOString(),
    paidAt: guide.paidAt?.toISOString(),
});

// Admin uploads a new tax guide
const createTaxGuide = async (req: Request, res: Response) => {
    if (req.user?.role !== 'AdminGeral' && !req.user?.permissions?.canManageDocuments) {
        return res.status(403).json({ message: 'Acesso negado.' });
    }
    const { clientId, name, referenceMonth, referenceYear, dueDate, amount, fileName, fileContent } = req.body;
    
    const newGuide = await req.prisma.taxGuide.create({
        data: {
            clientId: Number(clientId),
            name,
            referenceMonth: Number(referenceMonth),
            referenceYear: Number(referenceYear),
            dueDate: new Date(dueDate),
            amount: parseFloat(amount),
            status: 'Pendente',
            fileName,
            fileContent,
            uploadedBy: req.user.name,
        },
    });

    res.status(201).json(toAppTaxGuide(newGuide));
};

// Client marks a guide as paid
const markGuideAsPaid = async (req: Request, res: Response) => {
    const guideId = parseInt(req.params.id, 10);
    const { paymentReceipt } = req.body; // base64 string
    
    const guide = await req.prisma.taxGuide.findUnique({ where: { id: guideId } });

    if (!guide) {
        return res.status(404).json({ message: 'Guia não encontrada.' });
    }
    if (req.user?.role === 'Cliente' && !req.user.clientIds?.includes(guide.clientId)) {
        return res.status(403).json({ message: 'Acesso negado a esta guia.' });
    }

    const updatedGuide = await req.prisma.taxGuide.update({
        where: { id: guideId },
        data: {
            status: 'Pago',
            paidAt: new Date(),
            paymentReceipt: paymentReceipt || null,
        }
    });
    res.json(toAppTaxGuide(updatedGuide));
};

// Admin deletes a tax guide
const deleteTaxGuide = async (req: Request, res: Response) => {
    if (req.user?.role !== 'AdminGeral' && !req.user?.permissions?.canManageDocuments) {
        return res.status(403).json({ message: 'Acesso negado.' });
    }
    const guideId = parseInt(req.params.id, 10);

    try {
        await req.prisma.taxGuide.delete({ where: { id: guideId } });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(404).json({ message: 'Guia não encontrada.' });
    }
};

router.post('/', createTaxGuide);
router.put('/:id/pay', markGuideAsPaid);
router.delete('/:id', deleteTaxGuide);

export { router as taxGuidesRouter };
