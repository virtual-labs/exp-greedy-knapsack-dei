## Introduction

The main objective of fractional knapsack problem is to select items in such a way that the **total value obtained is maximized** while ensuring that the **total weight of the selected items does not exceed the capacity of the knapsack**.

This problem is widely used to demonstrate the application of **greedy algorithms**, as it satisfies the greedy choice property and optimal substructure. The fractional nature of the problem allows items to be divided, making it computationally efficient and conceptually intuitive.

---

## Problem Definition

Consider a knapsack with a maximum weight capacity W. There are n items available, and each item i has:
- a **weight** wᵢ
- a **value (profit)** vᵢ

The goal is to select items (or fractions of items) such that:
- The total weight of selected items is less than or equal to W.
- The total value obtained is maximized.

Mathematically:

**Objective:**
Maximize the total value obtained from the selected items.

Total Value = v1 + v2 + v3 + ... + vn

**Subject to the constraint:**
The total weight of the selected items must not exceed the knapsack capacity W.

Total Weight ≤ W


Where:
- vi represents the value of item i.
- wi represents the weight of item i.
- n is the total number of items

## Fractional Property 

The defining characteristic of the Fractional Knapsack Problem is that **items can be divided into fractions**.

If an item cannot be completely placed into the knapsack due to weight constraints, a **fraction of the item** can be taken. The value gained from the fraction is **directly proportional** to the fraction of weight taken.

For example, if half of an item is taken, half of its value is obtained. This property distinguishes the fractional knapsack problem from the 0/1 knapsack problem, where items must be taken entirely or not at all.

---

## Greedy Approach

The Fractional Knapsack Problem is solved using a **greedy strategy**, where the locally optimal choice is made at each step with the aim of achieving a globally optimal solution.

### Greedy Criterion

To apply the greedy approach, a decision parameter called the **value-to-weight ratio** is calculated for each item.

Value-to-Weight Ratio (Ri) = Value of item (vi) / Weight of item (wi)

This ratio indicates the amount of value gained per unit weight of an item.

### Greedy Rule

Items are selected in **descending order of their value-to-weight ratio**. Items with a higher ratio are given priority, as they provide more value per unit weight.

---

## Algorithm Explanation

1. Calculate the value-to-weight ratio for each item.
2. Sort all items in decreasing order of their ratios.
3. Initialize currentWeight = 0 and totalValue = 0.
4. Traverse the sorted list of items:
   - If the entire item can be added without exceeding capacity, add it completely.
   - Otherwise, add the maximum possible fraction of the item that fits and terminate the process.

---

## Illustrative Examples

1. Assume a knapsack with capacity: W = 50


Available items are:

| Item | Weight (wᵢ) | Value (vᵢ) | Ratio (vᵢ / wᵢ) |
|------|---------------|--------------|------------------|
| A | 10 | 60 | 6.0 |
| B | 20 | 100 | 5.0 |
| C | 30 | 120 | 4.0 |

After computing the value-to-weight ratios and sorting in descending order, the order becomes:  
**A → B → C**

### Step-by-Step Selection

- **Item A** is fully selected:  
  - Weight used = 10  
  - Value gained = 60  

- **Item B** is fully selected:  
  - Weight used = 20  
  - Value gained = 100  

- **Item C** is partially selected (fractional selection):  
  - Fraction selected = 20 / 30  
  - Value gained = (20 / 30) × 120 = 80  

### Capacity Analysis

- Total weight of selected items = 10 + 20 + 20 = **50**
- Knapsack capacity = **50**
- Remaining capacity = **0** (Knapsack is fully filled)

### Final Results

- **Total weight used = 50**
- **Total value obtained = 240**
- **Unused capacity = 0**
---

2. Assume a knapsack with capacity: **W = 100**

Available items are:

| Item | Weight (wᵢ) | Value (vᵢ) | Ratio (vᵢ / wᵢs) |
|------|---------------|--------------|------------------|
| P    | 10            | 50           | 5.0              |
| Q    | 20            | 80           | 4.0              |
| R    | 30            | 90           | 3.0              |

After computing the value-to-weight ratios and sorting in descending order, the order becomes:  
**P → Q → R**

### Step-by-Step Selection

- **Item P** is fully selected:  
  - Weight used = 10  
  - Value gained = 50  

- **Item Q** is fully selected:  
  - Weight used = 20  
  - Value gained = 80  

- **Item R** is fully selected:  
  - Weight used = 30  
  - Value gained = 90  

### Capacity Analysis

- Total weight of all items = 10 + 20 + 30 = **60**
- Knapsack capacity = **100**
- Remaining capacity = **40**

Since **no items remain**, the algorithm terminates execution even though the knapsack is not completely filled.

### Final Results

- **Total weight used = 60**
- **Total value obtained = 220**
- **Unused capacity = 40**

### Key Observation

In the Fractional Knapsack problem, **each item can be selected at most once**.  
If the knapsack capacity is greater than the sum of all item weights, **all items are selected fully**, and the remaining capacity remains unused. No repetition or forced fractional selection occurs.

## Why the Greedy Approach Works

The Fractional Knapsack Problem satisfies the **Greedy Choice Property**, which means that selecting the locally optimal item (with the highest value-to-weight ratio) at each step leads to the globally optimal solution.

Since the value gained is directly proportional to the weight taken, there is no advantage in postponing or skipping an item with a higher ratio. This guarantees optimality when using a greedy strategy, a property that does not hold in the 0/1 knapsack problem.

---

## Complexity Analysis

### Time Complexity

- Sorting items based on ratio: O(n log n)
- Selecting items: O(n)

Overall time complexity: O(n log n)


### Space Complexity 

Overall space complexity: O(n)


---

## Applications of Fractional Knapsack

### Cargo Loading and Logistics Management

The **Fractional Knapsack concept is widely applied in cargo loading and transportation systems**, where goods can be divided into smaller parts (e.g., grains, liquids, chemicals, bulk materials).  

In cargo loading, a vehicle or container has a **maximum weight capacity**, and each type of cargo has an associated **value per unit weight**. The goal is to **maximize the total value of goods loaded without exceeding the weight limit**.

Using the Fractional Knapsack approach:
- Each cargo type is treated as an item with a **weight and value**.
- The **value-to-weight ratio** represents profit or importance per unit weight.
- Cargo types with the highest value-to-weight ratio are loaded first.
- If the remaining capacity cannot hold an entire cargo batch, **only a fraction of that cargo is loaded** to fully utilize the available capacity.

This approach ensures **maximum profit or utility from limited transportation capacity**, making it highly suitable for logistics optimization.

---

### Other Applications

- **Resource Allocation Problems:** Distributing limited resources among competing tasks to maximize efficiency or output.
- **Budget Optimization:** Allocating funds to projects where partial funding is allowed and yields proportional benefits.
- **Bandwidth Allocation:** Assigning network bandwidth to different services or users based on priority and efficiency.
- **Cutting and Blending Problems:** Used in industries like metallurgy and food processing where materials can be mixed or divided in fractional quantities.

---



