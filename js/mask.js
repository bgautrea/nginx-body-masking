function getLastParam(r) {
		var request_uri = r.uri.split('/');
		var last_param = request_uri[request_uri.length - 1];
		return last_param;
};

function maskRequestBody(r) {
	var request_body = r.requestBody;
	var shouldMask = r.variables.bar;
	if (String(shouldMask) == 0) {
	  request_body = 'MASKED by NGINX';
	} 
	return request_body
}
