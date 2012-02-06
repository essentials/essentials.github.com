var commandsTable,
	permissionsTable,
	isEditing = false;

function addCommandDetails(nTr, tid, img) {
	$.ajax({
		url		: 'docs/fetch/command_details/'+tid,
		type	: 'get',
		dataType: 'json',
		success	: function(data) {
			if(data.status == false) {
				alert(data.message);
			}
			else {
				commandsTable.fnOpen(nTr, data.permissions, 'command-details-row');
				$('.button').button();
			}
		}
	});
}

function toggleCommandDetails(nTr) {
	var img = $('img.details-img', nTr);
	if(img.length == 0) {
		return;
	}
	
	if($(img).attr('src').match('round_remove')) {
		// This row is already open...close it
		$(img).attr('src', 'assets/img/round_add.png');
		commandsTable.fnClose(nTr);
	}
	else {
		// Open the row
		var aData = commandsTable.fnGetData(nTr);
		$(img).attr('src', 'assets/img/round_remove.png');
		addCommandDetails(nTr, aData[0], this);
	}
}

function addNewPermission(table, tid) {
	var insert = '<tr>';
	insert += '<td class="center">'+(tid == 0 ? '<img src="assets/img/delete.png" class="delete-perm">' : '<input type="hidden" name="tid" value="'+tid+'" />')+'</td>';
	insert += '<td><input type="text" name="perm[]" placeholder="essentials.permission" /></td>';
	insert += '<td><input type="text" name="pdesc[]" placeholder="Description" />'+
				(tid == 'x' ? '' : '<button class="save-perm button">Save</button>&nbsp;<button class="cancel-perm button">Cancel</button>')+
				'</td>'+
				'</tr>';
	
	$(table).append(insert);
}

function updateMsg(e, msg) {
	$(e).text(msg).
		addClass('ui-state-highlight');
	setTimeout(function() {
		e.removeClass('ui-state-highlight', 1500);
	}, 500);
}

function checkIsSet(o, n, e) {
	if(o.val().length == 0) {
		o.addClass('ui-state-error');
		updateMsg(e, n + ' cannot be empty.');
		return false;
	}
	
	return true;
}

function bindEditable() {
	$('.editable').editable('docs/update', {
		event		: 'dblclick',
		placeholder	: '<em>Double-click to edit</em>',
		tooltip		: 'Double-click to edit',
		data		: function(value, settings) {
			isEditing = true;
			return value.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
		},
		callback	: function(value, settings) {
			isEditing = false;
		}
	});
	$('.editautocomplete').editable('docs/update', {
		type		: 'autocomplete',
		source		: 'docs/fetch/category',
		event		: 'dblclick',
		placeholder	: '<em>Double-click to edit</em>',
		tooltip		: 'Double-click to edit',
		data		: function(value, settings) {
			isEditing = true;
			return value;
		},
		callback	: function(value, settings) {
			isEditing = false;
		}
	});
	$('.editarea').editable('docs/update', {
		event		: 'dblclick',
		type		: 'textarea',
		rows		: 3,
		cols		: 80,
		submit		: 'ok',
		placeholder	: '<em>Double-click to edit</em>',
		tooltip		: 'Double-click to edit',
		data		: function(value, settings) {
			isEditing = true;
			return value.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\<br ?\/?\>/g, "\r");
		},
		callback	: function(value, settings) {
			isEditing = false;
		}
	});
}

$(document).ready(function() {
	$('.button').button();
	
	commandsTable = $('#commands').dataTable({
		bAutoWidth		: false,
		bFilter			: true,
		bJQueryUI		: true,
		bLengthChange	: false,
		bPaginate		: false,
		bSort			: true,
		aaSorting		: [ [2,'asc'], [3,'asc'] ],
		iDisplayLength	: 20,
		aoColumns		: [
		   { 'bVisible' : false },
		   { 'sWidth'   : '5%',  'bSortable' : false },
		   { 'sWidth'   : '10%', 'bSortable' : true  },
		   { 'sWidth'   : '15%', 'bSortable' : true  },
		   { 'sWidth'   : '15%', 'bSortable' : true  },
		   { 'sWidth'   : '15%', 'bSortable' : true  },
		   { 'sWidth'   : '25%', 'bSortable' : false }
		],
		fnRowCallback	: function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
			$('td:eq(0)', nRow).addClass('center');
			$('td:eq(1)', nRow).attr('id', 'cmd-'+aData[0]+'-cat').addClass('editautocomplete');
			$('td:eq(2)', nRow).attr('id', 'cmd-'+aData[0]+'-trigger').addClass('editable');
			$('td:eq(3)', nRow).attr('id', 'cmd-'+aData[0]+'-alias').addClass('editable');
			$('td:eq(4)', nRow).attr('id', 'cmd-'+aData[0]+'-desc').addClass('editable');
			$('td:eq(5)', nRow).attr('id', 'cmd-'+aData[0]+'-syntax').addClass('editarea');
			
			return nRow;
		}
	});
	
	permissionsTable = $('#permissions').dataTable({
		bAutoWidth		: false,
		bFilter			: true,
		bJQueryUI		: true,
		bLengthChange	: false,
		bPaginate		: false,
		bSort			: true,
		aaSorting		: [ [2,'asc'], [3,'asc'], [4,'asc'] ],
		iDisplayLength	: 20,
		aoColumns		: [
		   { 'bVisible' : false },
		   { 'bVisible' : false },
		   { 'sWidth'   : '10%', 'bSortable' : true  },
		   { 'sWidth'   : '15%', 'bSortable' : true  },
		   { 'sWidth'   : '25%', 'bSortable' : true  },
		   { 'sWidth'   : '50%', 'bSortable' : true  },
		]
	});
	
	$('.delete-item').live('click', function() {
		var id = $(this).attr('id').split('-'),
			confirmMsg = 'Are you sure you want to delete this ',
			row = this.parentNode.parentNode;
		
		if(id[0] == 'cmd') {
			confirmMsg += 'command\n- all associated permissions will be removed?';
		}
		else if(id[0] == 'perm') {
			confirmMsg += 'permission?';
		}
		else {
			return;
		}
		
		confirmMsg += '\nThis action cannot be undone.';
		if(confirm(confirmMsg)) {
			$.ajax({
				url		: 'docs/delete/'+id[0]+'/'+id[1],
				type	: 'get',
				dataType: 'json',
				success	: function(data) {
					if(data.status == false) {
						alert(data.message);
						return;
					}
					
					if(id[0] == 'cmd') {
						commandsTable.fnClose(row);
						commandsTable.fnDeleteRow(row);
					}
					else {
						$(row).remove();
					}
				}
			});
		}
	});
	
	$('.add-permission').live('click', function() {
		// Only one perm can be added at a time
		var parent = this.parentNode,
			id = $(this).attr('id').split('-');
		if($('input', $(parent).siblings('table')[0]).length && id[1] != 'x') {
			return;
		}
		addNewPermission($(parent).siblings('table'), id[1]);
		$('.button').button();
	});
	
	$('.save-perm').live('click', function() {
		var row = this.parentNode.parentNode,
			parent = row.parentNode,
			data = 'tid='+$('input[name="tid"]', row).val()+
					'&perm='+$('input[name="perm[]"]', row).val()+
					'&pdesc='+$('input[name="pdesc[]"]', row).val();
		
		$.ajax({
			url		: 'docs/insert/permission',
			type	: 'post',
			dataType: 'json',
			data	: data,
			success	: function(data) {
				if(data.status == false) {
					alert(data.message);
					return;
				}
				
				$(row).remove();
				$(parent).append(data.permission);
			}
		});
	});
	
	$('.cancel-perm').live('click', function() {
		$(this.parentNode.parentNode).remove();
	});
	
	$('#add-command').click(function() {
		$('#new-command-form').dialog('open');
	});
	
	$('#new-command-form #cat').autocomplete({
		source		: function(request, response) {
			$.ajax({
				url		: 'docs/fetch/category/' + request.term,
				type	: 'get',
				dataType: 'json',
				success	: function(data) {
					response(data);
				}
			})
		},
		minLength	: 2
	});
	
	$('#new-command-form img.delete-perm').live('click', function() {
		$(this.parentNode.parentNode).remove();
	});
	
	$('#new-command-form').dialog({
		autoOpen	: false,
		height		: 'auto',
		width		: 450,
		model		: true,
		buttons		: {
			'Add Command'	: function() {
				$('#new-command-form input, #new-command-form textarea').removeClass('ui-state-error');
				var bValid = true,
					msgDom = $('#validation-msg');
				
				bValid = bValid && checkIsSet($('#cat'), 'Category', msgDom);
				bValid = bValid && checkIsSet($('#trigger'), 'Trigger', msgDom);
				bValid = bValid && checkIsSet($('#desc'), 'Description', msgDom);
				bValid = bValid && checkIsSet($('#syntax'), 'Syntax', msgDom);
				
				if(bValid) {
					var data = '';
					$('#new-command-form input, #new-command-form textarea').each(function(index, element) {
						data += (data.length ? '&' : '') + $(element).attr('name') + '=' + $(element).val();
					});
					$.ajax({
						url		: 'docs/insert/command',
						type	: 'post',
						dataType: 'json',
						data	: data,
						success	: function(data) {
							if(data.status == false) {
								alert(data.message);
								return false;
							}
							
							commandsTable.fnAddData(data.command);
							$('#new-command-form').dialog('close');
						}
					});
				}
			},
			'Cancel'		: function() {
				$(this).dialog('close');
			}
		},
		open		: function() {
			$('#validation-msg').empty();
			$('#new-command-form input, #new-command-form textarea').val('').removeClass('ui-state-error');
			$('#new-command-form table.command-permissions tbody').empty();
			addNewPermission($('#new-command-form table.command-permissions'), 'x');
			$('#new-command-form input#cat').focus();
		}
	});
	
	if(jQuery.editable) {
		$('.details-img').live('click', function() {
			toggleCommandDetails(this.parentNode.parentNode);
		});

		bindEditable();
		$('.editable').live('dblclick', function(event) {
			if(isEditing == false) {
				bindEditable();
				$(this).trigger('dblclick');
			}
		});
		$('.editarea').live('dblclick', function(event) {
			if(isEditing == false) {
				bindEditable();
				$(this).trigger('dblclick');
			}
		});
	}
	else {
		$('#commands > tbody > tr > td').live('click', function() {
			toggleCommandDetails(this.parentNode);
		});
	}
});