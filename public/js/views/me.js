$(function () {
	// Only reveal mentoring fields when appropriate
	const mentoringFields = $('.mentoring-fields');
	const mentoringCheck = $('input[name="mentoring.available"]');

	mentoringCheck.change(function () {
		mentoringFields[$(this).prop('checked') ? 'show' : 'hide']();
	});
	if (!mentoringCheck.prop('checked')) {
		mentoringFields.hide();
	}
});
