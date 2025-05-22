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
        lastId = doc.data().orderId;
      });
      const newId = lastId + 1;

      const budgetCreated = await firestore.collection("budgets").add({
        orderId: newId,
        client: data.client,
        deliveryAddress: data.deliveryAddress,
        billingAddress: data.billingAddress,
        products: data.products,
        createdAt: data.createdAt,
        orderStatus: data.orderStatus,
        totalValue: data.totalValue,
        imagesUrls: data.imagesUrls ?? [],
        detailsPropostal: data.detailsPropostal ?? {},
      });

      let budgetData = null;

      budgetCreated.onSnapshot((snapshot) => {
        budgetData = snapshot.data();
        if (budgetData) {
          console.log("Budget created with ID:", budgetData.orderId);
          console.log("Budget data:", budgetData);
        } else {
          console.log("No such document!");
        }
      });

      return budgetData;
    } catch (error) {
      console.error("Error in CreateBudgetService:", error);
      return {
        success: false,
        message: "Erro ao criar orçamento.",
      };
    }
  }
}
