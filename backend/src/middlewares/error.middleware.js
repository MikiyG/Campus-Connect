// src/middlewares/error.middleware.js
module.exports = (err, req, res, next) => {
	console.error(err);
	if (res.headersSent) return next(err);
	const status = err.status || 500;
	// normalize to { message: ... } so frontend sees `err.response.data.message`
	res.status(status).json({ message: err.message || 'Server error' });
};
