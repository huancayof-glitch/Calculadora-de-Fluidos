(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const weightInput = $("weightInput");
  const hoursInput = $("hoursInput");
  const weightField = $("weightField");
  const hoursField = $("hoursField");
  const weightError = $("weightError");
  const hoursError = $("hoursError");
  const emptyState = $("emptyState");
  const results = $("results");
  const clearButton = $("clearButton");
  const quickChips = Array.prototype.slice.call(document.querySelectorAll(".quick-chip"));

  const numberFormatter = typeof Intl !== "undefined"
    ? new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 })
    : null;
  const surfaceFormatter = typeof Intl !== "undefined"
    ? new Intl.NumberFormat("es-ES", { minimumFractionDigits: 3, maximumFractionDigits: 3 })
    : null;

  function format(value, decimals) {
    if (!Number.isFinite(value)) return "—";
    if (decimals === 3) {
      return surfaceFormatter ? surfaceFormatter.format(value) : value.toFixed(3);
    }
    return numberFormatter ? numberFormatter.format(value) : value.toFixed(2).replace(/\.00$/, "");
  }

  function parseLocaleNumber(raw) {
    const text = String(raw || "").trim().replace(/\s+/g, "");
    if (!text) return { empty: true, value: NaN };
    if (!/^[+]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text)) {
      return { empty: false, value: NaN };
    }
    const normalized = text.replace(",", ".");
    return { empty: false, value: Number(normalized) };
  }

  function setFieldError(field, errorNode, message) {
    field.classList.toggle("has-error", Boolean(message));
    errorNode.textContent = message || "";
  }

  function validateInput(parsed, label) {
    if (parsed.empty) return "";
    if (!Number.isFinite(parsed.value)) return "Ingresa un valor numérico válido.";
    if (parsed.value <= 0) return label + " debe ser mayor que cero.";
    return "";
  }

  function setEmptyMessage(hasAnyValue, hasError) {
    const title = emptyState.querySelector("h3");
    const copy = emptyState.querySelector("p");
    if (hasError) {
      title.textContent = "Revisa los datos";
      copy.textContent = "Corrige los campos marcados para ejecutar el cálculo.";
    } else if (hasAnyValue) {
      title.textContent = "Falta un dato";
      copy.textContent = "Completa peso y horas para ver los resultados del periodo.";
    } else {
      title.textContent = "Listo para calcular";
      copy.textContent = "Completa los dos campos para ver los resultados del periodo seleccionado.";
    }
  }

  function formulaWork(result) {
    const p = format(result.weight);
    const h = format(result.hours);
    let endogenous;
    let insensible;
    let surface = null;

    if (result.weight <= 30) {
      endogenous = "(" + p + " × 12 ÷ 24) × " + h + " = " + format(result.endogenous.total) + " mL";
    } else {
      endogenous = format(result.insensible.total) + " ÷ 3 = " + format(result.endogenous.total) + " mL*";
    }

    if (result.category === "lt10") {
      insensible = "(" + p + " × 23 ÷ 24) × " + h + " = " + format(result.insensible.total) + " mL";
    } else if (result.category === "10to30") {
      surface = "(" + p + " × 4 + 7) ÷ (" + p + " + 90) = " + format(result.bodySurfaceArea, 3) + " m²";
      insensible = "(" + format(result.bodySurfaceArea, 3) + " × 400 ÷ 24) × " + h + " = " + format(result.insensible.total) + " mL";
    } else {
      insensible = p + " × 0,5 × " + h + " = " + format(result.insensible.total) + " mL";
    }

    return { endogenous, insensible, surface };
  }

  function render(result) {
    $("categoryTag").textContent = result.category === "lt10" ? "< 10 kg" : result.category === "10to30" ? "10–30 kg" : "> 30 kg";
    $("categoryTag").className = "category-tag" + (result.category === "10to30" ? " mid" : result.category === "gt30" ? " high" : "");
    $("periodTag").textContent = format(result.hours) + " h";
    $("categoryLabel").textContent = result.categoryLabel;

    const showSurface = result.bodySurfaceArea !== null;
    $("surfaceAreaItem").hidden = !showSurface;
    $("surfaceAreaWorkBlock").hidden = !showSurface;
    if (showSurface) {
      $("surfaceAreaValue").textContent = format(result.bodySurfaceArea, 3) + " m²";
    }

    $("endogenousTotal").textContent = format(result.endogenous.total);
    $("endogenousHourly").textContent = format(result.endogenous.hourly) + " mL/h";
    $("endogenousFormula").textContent = result.endogenous.formula;
    $("insensibleTotal").textContent = format(result.insensible.total);
    $("insensibleHourly").textContent = format(result.insensible.hourly) + " mL/h";
    $("insensibleFormula").textContent = result.insensible.formula;

    $("endogenous12").textContent = format(result.endogenous.reference12h) + " mL";
    $("endogenous24").textContent = format(result.endogenous.reference24h) + " mL";
    $("insensible12").textContent = format(result.insensible.reference12h) + " mL";
    $("insensible24").textContent = format(result.insensible.reference24h) + " mL";

    const work = formulaWork(result);
    $("endogenousWork").textContent = work.endogenous;
    $("insensibleWork").textContent = work.insensible;
    if (work.surface) $("surfaceAreaWork").textContent = work.surface;

    $("sourceNote").hidden = !result.sourceClarificationRequired;
    emptyState.hidden = true;
    results.hidden = false;
  }

  function updateQuickChips(hoursValue) {
    quickChips.forEach(function (chip) {
      chip.classList.toggle("is-active", Number(chip.getAttribute("data-hours")) === hoursValue);
    });
  }

  function recalculate() {
    const weightParsed = parseLocaleNumber(weightInput.value);
    const hoursParsed = parseLocaleNumber(hoursInput.value);
    const weightMessage = validateInput(weightParsed, "El peso");
    const hoursMessage = validateInput(hoursParsed, "El número de horas");

    setFieldError(weightField, weightError, weightMessage);
    setFieldError(hoursField, hoursError, hoursMessage);
    updateQuickChips(hoursParsed.value);

    const hasAnyValue = !weightParsed.empty || !hoursParsed.empty;
    const hasError = Boolean(weightMessage || hoursMessage);
    const complete = !weightParsed.empty && !hoursParsed.empty;

    if (!complete || hasError) {
      results.hidden = true;
      emptyState.hidden = false;
      setEmptyMessage(hasAnyValue, hasError);
      return;
    }

    try {
      render(PediatricFluids.calculate(weightParsed.value, hoursParsed.value));
    } catch (error) {
      results.hidden = true;
      emptyState.hidden = false;
      setEmptyMessage(true, true);
    }
  }

  weightInput.addEventListener("input", recalculate);
  hoursInput.addEventListener("input", recalculate);

  weightInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      hoursInput.focus();
    }
  });
  hoursInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      hoursInput.blur();
    }
  });

  quickChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      hoursInput.value = chip.getAttribute("data-hours");
      recalculate();
      if (!weightInput.value.trim()) weightInput.focus();
    });
  });

  clearButton.addEventListener("click", function () {
    weightInput.value = "";
    hoursInput.value = "";
    setFieldError(weightField, weightError, "");
    setFieldError(hoursField, hoursError, "");
    updateQuickChips(NaN);
    results.hidden = true;
    emptyState.hidden = false;
    setEmptyMessage(false, false);
    weightInput.focus();
  });

  recalculate();
})();
