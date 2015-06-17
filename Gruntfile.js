module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['Gruntfile.js', 'script/**/*.js'],
			options: {
				globals: {
					jQuery: false
				}
			}
		},
		concat: {
			options: {
				separator: "n\;",
			},
			dist: {
				src: ['script/**/*.js'],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %>, version: <%= pkg.version %>, date: <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			dist: {
				files: {
					'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('test', ['jshint']);	
	grunt.registerTask('default', ['concat', 'uglify', 'jshint']);
};