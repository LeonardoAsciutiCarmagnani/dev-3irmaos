import { BudgetType } from "../../controllers/Order/OrderController";
import { firestore } from "../../firebaseConfig";

export class CreateBudgetService {
  public static async execute(data: BudgetType): Promise<any> {
    try {
      const validateLastId = await firestore
        .collection("budgets")
        .orderBy("orderId", "desc")
        .limit(1)
        .get();
      let lastId = 0;
      validateLastId.forEach((doc) => {
        lastId = doc.data().id;
      });
      const newId = lastId + 1;

      const budgetCreated = await firestore.collection("budgets").add({
        orderId: newId,
        client: data.client,
        deliveryAddress: data.deliveryAddress,
        products: data.products,
        createdAt: data.createdAt,
        orderStatus: data.orderStatus,
        totalValue: data.totalValue,
      });

      console.log("Budget created successfully:", budgetCreated);
      return budgetCreated;
    } catch (error) {
      console.error("Error in CreateBudgetService:", error);
      return {
        success: false,
        message: "Erro ao criar orçamento.",
      };
    }
  }
}
