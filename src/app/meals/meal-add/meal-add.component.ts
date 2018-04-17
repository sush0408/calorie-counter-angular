import { Component, OnInit, Input, Output, EventEmitter, Inject, ViewChild } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { Meal } from '../../shared/models/meal.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidateName } from '../../shared/validators/name.validator';


@Component({
  selector: 'app-meal-add',
  templateUrl: './meal-add.component.html',
  styleUrls: ['./meal-add.component.scss']
})
export class MealAddComponent implements OnInit {
  @Input() products: Product[];
  @Input() meals: Meal[];
  @Input() categories: string[];
  @Output() addMeal = new EventEmitter<Meal>();
  meal: Meal = <Meal>{};
  selectedIngredient: Product;
  ingredientAmount: number;
  ingredients: Product[] = <Product[]>[];
  weightTotal: number;
  proteinTotal: number;
  carbsTotal: number;
  fatsTotal: number;
  caloriesTotal: number;
  imageUrl: string;
  selectedCategory: string;
  addMealForm: FormGroup;

  errorMessages = {
    name: 'Name must be between 3 and 20 characters',
    nameTaken: 'Meal with that name already exists',
    category: 'Please choose category'
  };

  constructor(
    private dialogRef: MatDialogRef<MealAddComponent>,
    private formBuilder: FormBuilder
  ) { }

  getTotal(value) {
    let total = 0;
    for (let i = 0; i < this.ingredients.length; i++) {
      total = total + this.ingredients[i][value];
    }
    return total;
  }

  calculateTotalValues() {
    this.weightTotal = this.getTotal('weight');
    this.proteinTotal = this.getTotal('protein');
    this.carbsTotal = this.getTotal('carbs');
    this.fatsTotal = this.getTotal('fats');
    this.caloriesTotal = this.getTotal('calories');
  }

  onAddIngredient() {
    this.selectedIngredient = this.addMealForm.value.ingredient;
    this.selectedIngredient.weight = this.addMealForm.value.ingredientAmount;
    /* this.selectedIngredient.protein = Math.round(this.selectedIngredient.protein * this.selectedIngredient.weight / 100);
    this.selectedIngredient.carbs = Math.round(this.selectedIngredient.carbs * this.selectedIngredient.weight / 100);
    this.selectedIngredient.fats = Math.round(this.selectedIngredient.fats * this.selectedIngredient.weight / 100);
    this.selectedIngredient.calories = Math.round(this.selectedIngredient.calories * this.selectedIngredient.weight / 100); */
    for (const value in this.selectedIngredient) {
      if (this.selectedIngredient.hasOwnProperty(value) && value !== 'name' && value !== 'weight') {
        this.selectedIngredient[value] = Math.round(this.selectedIngredient[value] * this.selectedIngredient.weight / 100);
      }
    }
    this.ingredients.push(this.selectedIngredient);
    this.calculateTotalValues();
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  onAddMeal() {
    this.meal.name = this.addMealForm.value.name;
    this.meal.category = this.addMealForm.value.category;
    this.meal.ingredients = this.ingredients;
    this.meal.weight = this.weightTotal;
    this.meal.protein = this.proteinTotal;
    this.meal.carbs = this.carbsTotal;
    this.meal.fats = this.fatsTotal;
    this.meal.calories = this.caloriesTotal;

    if (this.addMealForm.valid) {
      this.addMeal.emit(this.meal);
      this.dialogRef.close();
    } else {
      this.validateAllFormFields(this.addMealForm);
    }

  }

  get name() {
    return this.addMealForm.controls.name;
  }

  ngOnInit() {
    this.addMealForm = new FormGroup({
      name: new FormControl('', [Validators.required, ValidateName(this.meals)]),
      imageUrl: new FormControl(''),
      category: new FormControl('', Validators.required),
      ingredient: new FormControl(''),
      ingredientAmount: new FormControl('')
    });
  }

}
